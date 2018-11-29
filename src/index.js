import React from 'react';
import ReactDOM from 'react-dom';
import uuidv4 from 'uuid/v4';
import './index.css';
import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { cloneDeep } from 'lodash';

const width = 960;
const height = 600;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.appRef = React.createRef();
    this.addNode = this.addNode.bind(this);
    this.addEdge = this.addEdge.bind(this);
    this.updateNodeText = this.updateNodeText.bind(this);
    /*
    this.state = {
      nodes: [],
      links: [],
      selectedNodeId: '',
    }
    */
    this.state = {
      nodes: [
        {id: 'a', text: 'node a', val: 1, x: width/2, y: height/2, vx: 0, vy: 0},
        {id: 'b', text: 'node b', val: 2, x: width/2, y: height/2, vx: 0, vy: 0},
        {id: 'c', text: 'node c', val: 4, x: width/2, y: height/2, vx: 0, vy: 0},
      ],
      links: [
        {source: 'c', target: 'b'},
        {source: 'c', target: 'a'},
      ],
      selectedNodeId: 'a',
    }
  }

  addNode(text) {
    const { nodes } = this.state;
    this.setState({nodes: [...nodes.slice(), {id: uuidv4(), text: text, val: 1}]});
  }

  addEdge(source, target) {
    const { links } = this.state;
    this.setState({links: [...links.slice(), {source: source, target: target}]});
  }

  selectNode(id, d3Nodes) {
    this.setState({
      nodes: cloneDeep(d3Nodes),
      selectedNodeId: id,
    });
  }

  updateNodeText(id, text) {
    const { nodes } = this.state;
    // Find the node that matches the id
    const i = nodes.findIndex(e => e.id === id);
    if (i === -1) {
      throw new Error(`node ${id} not found`);
    }
    const node = nodes[i];

    // Update the text
    const updatedNode = {id: node.id, text: text, val: 1, x: node.x, y: node.y, vx: node.vx, vy: node.vy};
    this.setState({nodes: cloneDeep([...nodes.slice(0, i), updatedNode, ...nodes.slice(i+1)])});
  }

  // Many ideas learned from
  //   https://beta.observablehq.com/@mbostock/d3-force-directed-graph
  //   http://bl.ocks.org/rkirsling/5001347
  renderGraph() {
    // Always pass clones of the nodes + links to d3 so it doesn't modify them
    const nodes = cloneDeep(this.state.nodes);
    const links = cloneDeep(this.state.links);

    //const svg = select(this.appRef);
    const svg = select('.graphviz'); // Why does this work and not the appRef selector?

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
    // Link Enter
    const link = svg.select('.links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
        .attr('stroke-width', d => 2)
        .attr('marker-end', 'url(#arrow)');

    // Link Remove
    link.exit().remove();

    // NODES
    // Node Update
    const nodeUpdate = svg.select('.nodes').selectAll('g').data(nodes);
    nodeUpdate.select('text')
        .text(d => d.text);
    nodeUpdate.select('circle').attr('fill', d => d.id === this.state.selectedNodeId ? 'blue' : 'red');

    // Node Enter
    // circles
    const nodeEnter = nodeUpdate.enter().append('g');
    const circlesEnter = nodeEnter.append('circle')
      .attr('r', 10)
      .attr('fill', d => d.id === this.state.selectedNodeId ? 'blue' : 'red');

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
    // Setting alphaTarget is essential to ensure links stay synced to nodes, but I don't know why
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
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
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
    const { nodes, links, selectedNodeId } = this.state;
    return (
      <div>
        <svg width={width} height={height} className="graphviz" ref={this.appRef} />
        <NodeEditForm
          key={selectedNodeId} // Need key so selecting new node re-renders NodeEditForm
          updateNodeText={this.updateNodeText}
          selectedNodeId={selectedNodeId}
          nodes={nodes}
        />
        <NodeForm addNode={this.addNode} />
        <EdgeForm nodes={nodes} links={links} addEdge={this.addEdge} />
      </div>
    );
  }
}

class NodeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.addNode(this.state.value);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Task:
        <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

class EdgeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      source: this.props.nodes[0].id,
      target: this.props.nodes[0].id,
    };
    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSourceChange(event) {
    this.setState({source: event.target.value});
  }

  handleTargetChange(event) {
    this.setState({target: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.addEdge(this.state.source, this.state.target);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Edge Source:
          <select value={this.state.source} onChange={this.handleSourceChange}>
            {
              this.props.nodes.map(node  => (
                <option key={node.id} value={node.id}>{node.text}</option>
              ))
            }
          </select>
        </label>

        <label>
          Edge Target:
          <select value={this.state.target} onChange={this.handleTargetChange}>
            {
              this.props.nodes.map(node  => (
                <option key={node.id} value={node.id}>{node.text}</option>
              ))
            }
          </select>
        </label>

        <input type="submit" value="Submit" />
      </form>
    );
  }
}

class NodeEditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.getSelectedNodeText()
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.updateNodeText(this.props.selectedNodeId, this.state.value);
  }

  getSelectedNodeText() {
    const idx = this.props.nodes.findIndex(e => e.id === this.props.selectedNodeId);
    return this.props.nodes[idx].text;
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Edit Node:
        <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
