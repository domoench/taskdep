import React from 'react';
import uuidv4 from 'uuid/v4';
import './App.css';
import EditForm from './editForm.js'
import NodeForm from './nodeForm.js'
import LinkForm from './linkForm.js'
import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { cloneDeep, filter } from 'lodash';

const width = 960;
const height = 600;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.appRef = React.createRef();
    this.addNode = this.addNode.bind(this);
    this.removeNode = this.removeNode.bind(this);
    this.addLink = this.addLink.bind(this);
    this.updateNodeText = this.updateNodeText.bind(this);
    this.state = {
      nodes: [],
      links: [],
      selected: {nodeId: '', linkId: ''}, // can be nothing, a node, or a link
    }
  }

  addNode(text) {
    const { nodes } = this.state;
    this.setState({nodes: [...nodes.slice(), {id: uuidv4(), text: text, val: 1}]});
  }

  addLink(source, target) {
    const { links } = this.state;
    this.setState({links: [...links.slice(), {source: source, target: target}]});
  }

  selectNode(nodeId, d3Nodes) {
    this.setState({
      nodes: cloneDeep(d3Nodes), // Persist x,y,vx,vy info so graph doesn't jump
      selected: {nodeId: nodeId, linkId: ''},
    });
  }

  selectLink(linkId, d3Nodes) {
    console.log('selectLink()');
    this.setState({
      nodes: cloneDeep(d3Nodes), // Persist x,y,vx,vy info so graph doesn't jump
      selected: {nodeId: '', linkId: linkId},
    });
  }

  // Returns the index of the node with the given Id
  findNodeIdx(nodeId) {
    const { nodes } = this.state;
    const i = nodes.findIndex(e => e.id === nodeId);
    if (i === -1) {
      // TODO: Learn idiomatic way of error handling in JS
      throw new Error(`node ${nodeId} not found`);
    }
    return i;
  }

  updateNodeText(nodeId, text) {
    const { nodes } = this.state;
    const i = this.findNodeIdx(nodeId);
    const node = nodes[i];

    // Update the text
    const updatedNode = {id: node.id, text: text, val: 1, x: node.x, y: node.y, vx: node.vx, vy: node.vy};
    this.setState({nodes: cloneDeep([...nodes.slice(0, i), updatedNode, ...nodes.slice(i+1)])});
  }

  removeNode(nodeId) {
    const { nodes, links } = this.state;
    const i = this.findNodeIdx(nodeId);

    // Returns true if a link doesn't reference the nodeId
    const linkDoesntRefNode = (l) => {
      return l.target !== nodeId && l.source !== nodeId;
    }

    this.setState({
      links: cloneDeep(filter(links, linkDoesntRefNode)),
      nodes: cloneDeep([...nodes.slice(0, i), ...nodes.slice(i+1)]),
    });
  }

  /* Many ideas learned from
   *   https://beta.observablehq.com/@mbostock/d3-force-directed-graph
   *   http://bl.ocks.org/rkirsling/5001347
   *
   * TODO Document somewhere
   * - differences between react-maintained and d3 maintained nodes/links. e.g. in react
   *   links refer to node IDs, while in d3 links refer to node objects.
   */
  renderGraph() {
    const { selected } = this.state;
    console.log('renderGraph(). selected: ', selected);
    // Always pass clones of the nodes + links to d3 so it doesn't modify react state
    const nodes = cloneDeep(this.state.nodes);
    const links = cloneDeep(this.state.links);

    //const svg = select(this.appRef);
    const svg = select('.graphviz'); // TODO: Why does this work and not the appRef selector?

    // Custom downwards force
    const forceDown = alpha => {
      for (let i = 0; i < nodes.length; ++i) {
        const k = alpha * 0.1;
        const node = nodes[i];
        const dyB = height - node.y; // Dist from bottom
        node.vy -= dyB * k;
      }
    }

    // Custom upwards force
    // Equal to downwards force if nodes have same value, but stronger
    // for higher values, so higher value nodes rise to the top.
    const forceUp = alpha => {
      for (let i = 0; i < nodes.length; ++i) {
        const k = alpha * 0.1;
        const node = nodes[i];
        const v = node.val;
        const dyT = node.y // Dist from top
        node.vy -= (dyT * k) + (v * 0.03);
      }
    }

    const simulation = forceSimulation()
        .force('link', forceLink().id(function(d) { return d.id; }))
        .force('charge', forceManyBody().strength(-100))
        .force('center', forceCenter(width / 2, height / 2))
        .force('up', forceUp)
        .force('down', forceDown);

    // LINKS
    // Link data bind
    let link = svg.select('.links')
      .selectAll('line')
      .data(links, (d) => d.source + '-' + d.target);

    // Link exit
    link.exit().remove();

    // Link enter + update
    link = link.enter().append('line')
      .attr('marker-end', 'url(#arrow)')
      .classed('selected', d => {
        debugger;
        return `${d.source}-${d.target}` === selected.linkId;
      })
      .on('click', (d) => {
        const linkId = `${d.source.id}-${d.target.id}`;
        console.log('linkId: ', linkId);
        this.selectLink(linkId, simulation.nodes())
      })
      .merge(link);

    // NODES
    // TODO: Update organization to be idiomatic according to general update pattern: https://bl.ocks.org/mbostock/3808218
    // Node Update
    const nodeUpdate = svg.select('.nodes').selectAll('g').data(nodes, (d) => d.id);
    nodeUpdate.select('text')
        .text(d => d.text);
    nodeUpdate.select('circle').attr('fill', d => d.id === selected.nodeId ? 'blue' : 'red');

    // Node Enter
    // circles
    const nodeEnter = nodeUpdate.enter().append('g');
    const circlesEnter = nodeEnter.append('circle')
      .attr('r', 10)
      .attr('fill', d => d.id === selected.nodeId ? 'blue' : 'red');

    const circlesUpdate = nodeUpdate.select('circle');

    // labels
    nodeEnter.append("text")
      .text(d => d.text)
      .attr('x', 6)
      .attr('y', 3);

    // Node remove
    nodeUpdate.exit().remove();

    // Bind data to simulation
    simulation
      .nodes(nodes)
      .on('tick', ticked);

    simulation.force('link')
        .links(links)
        .distance(100);

    // Must restart to re-energize old nodes when new ones are added via user interaction: https://github.com/d3/d3-force#simulation_restart
    // Setting alphaTarget is essential to ensure links stay synced to nodes.
    // TODO// Figure out why you need to set alphaTartget, and how to make the simulation come to a stop
    simulation.alphaTarget(0.001).restart();

    // Updates the line end and circle render positions to their new positions
    // resulting from this tick of force calculations
    function ticked() {
      link
          .attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });

      nodeEnter
          .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
          })
    }

    // TODO: Can't you use merge to avoid repetition here?
    circlesEnter.on('click', (d) => {
      this.selectNode(d.id, simulation.nodes());
    });
    circlesUpdate.on('click', (d) => {
      this.selectNode(d.id, simulation.nodes());
    });
  }

  componentDidMount() {
    // Perform d3 setup that only needs to happen once
    const svg = select('.graphviz'); // Why does this work and not the appRef selector?
    // Arrow marker def
    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 18)
        .attr('refY', 5)
        .attr('markerWidth', 4)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z');

    svg.append('g').attr('class', 'links');
    svg.append('g').attr('class', 'nodes');

    this.renderGraph();
  }

  componentDidUpdate() {
    this.renderGraph();
  }

  render() {
    const { nodes, links, selected } = this.state;
    return (
      <div>
        <svg width={width} height={height} className="graphviz" ref={this.appRef} />
        <EditForm
          key={selected.nodeId} // Need key so selecting new node re-renders EditForm
          updateNodeText={this.updateNodeText}
          removeNode={this.removeNode}
          selected={selected}
          nodes={nodes}
        />
        <NodeForm addNode={this.addNode} />
        <LinkForm key={nodes.length} nodes={nodes} links={links} addLink={this.addLink} />
      </div>
    );
  }
}
