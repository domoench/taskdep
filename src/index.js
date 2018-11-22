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
    // this.renderGraph = this.renderGraph.bind(this); // TODO necessary?
    this.addNode = this.addNode.bind(this);
    this.addEdge = this.addEdge.bind(this);
    this.updateNodeText = this.updateNodeText.bind(this);
    /*
    this.state = {
      nodes: [],
      links: [],
    }
    */
    this.state = {
      nodes: [
        {id: 'a', text: 'node a', val: 1},
        {id: 'b', text: 'node b', val: 2},
        {id: 'c', text: 'node c', val: 4},
        {id: 'd', text: 'node d', val: 6},
      ],
      links: [
        {source: 'c', target: 'b'},
        {source: 'c', target: 'a'},
        {source: 'a', target: 'd'},
      ],
    }
  }

  addNode(text) {
    const { nodes } = this.state;
    this.setState({nodes: [...cloneDeep(nodes), {id: uuidv4(), text: text, val: 1}]});
  }

  addEdge(source, target) {
    const { links } = this.state;
    this.setState({links: [...cloneDeep(links), {source: source, target: target}]});
  }

  updateNodeText(id, text) {
    const { nodes } = this.state;
    // Find the node that matches the id
    const i = nodes.findIndex(e => e.id === id);
    if (i === -1) {
      alert('oops'); // TODO
    }
    const node = nodes[i];
    // Update the text
    const updatedNode = {id: node.id, text: text, val: 1};
    this.setState({nodes: [...cloneDeep(nodes.slice(0, i)), updatedNode, ...cloneDeep(nodes.slice(i+1))]});
  }

  renderGraph() {
    // Must make a copy of nodes + links from state because d3 will modify (e.g. adding
    // position and velocity attributes to nodes)
    const nodes = cloneDeep(this.state.nodes);
    const links = cloneDeep(this.state.links);

    // Many ideas used from
    //   https://beta.observablehq.com/@mbostock/d3-force-directed-graph
    //   http://bl.ocks.org/rkirsling/5001347
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
        .force('charge', forceManyBody().strength(-150))
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
    const node = svg.select('.nodes').selectAll('g').data(nodes);
    const nodeEnter = node.enter().append('g');

    // Node Enter
    // circles
    const circles = nodeEnter.append('circle')
      .attr('r', 10)
      .attr('fill', 'red');

    // labels
    nodeEnter.append("text")
      .text(d => d.text)
      .attr('x', 6)
      .attr('y', 3);

    // Node Update
    node.select('text')
        .text(d => d.text);

    // Node remove
    node.exit().remove();

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

    circles.on('click', (d) => {
      this.updateNodeText(d.id, 'clicked');
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
    const { nodes, links } = this.state;
    return (
      <div>
        <svg width={width} height={height} className="graphviz" ref={this.appRef} />
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

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
