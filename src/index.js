import React from 'react';
import ReactDOM from 'react-dom';
import uuidv4 from 'uuid/v4';
import './index.css';
import { select } from 'd3-selection'
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force'

const width = 960;
const height = 600;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.appRef = React.createRef();
    // this.renderGraph = this.renderGraph.bind(this); // TODO necessary?
    this.addNode = this.addNode.bind(this);
    this.addEdge = this.addEdge.bind(this);
    /*
    this.state = {
      nodes: [],
      links: [],
    }
    */
    this.state = {
      nodes: [
        {"id": "a", "text": "node a"},
        {"id": "b", "text": "node b"},
        {"id": "c", "text": "node c"},
        {"id": "d", "text": "node d"},
      ],
      links: [
        {"source": "a", "target": "b"},
        {"source": "a", "target": "c"},
        {"source": "c", "target": "d"},
      ],
    }
  }

  addNode(text) {
    this.setState({nodes: [...this.state.nodes, {id: uuidv4(), text: text}]});
  }

  addEdge(source, target) {
    this.setState({links: [...this.state.links, {source: source, target: target}]});
  }

  renderGraph() {
		console.log('renderGraph() state: ', this.state);
    // Many ideas used from https://beta.observablehq.com/@mbostock/d3-force-directed-graph
    //const svg = select(this.appRef);
    const svg = select('.graphviz'); // Why does this work and not the appRef selector?

    const simulation = forceSimulation()
        .force("link", forceLink().id(function(d) { return d.id; }))
        .force("charge", forceManyBody())
        .force("center", forceCenter(width / 2, height / 2));

    const link = svg.append('g')
        .attr('class', 'links')
      .selectAll('line')
      .data(this.state.links)
      .enter().append('line')
        .attr('stroke-width', d => 2);

		link.exit().remove();

    const node = svg.append('g')
         .attr('class', 'nodes')
      .selectAll('g')
      .data(this.state.nodes)
      .enter().append('g');

		node.exit().remove();

		// circles
    node.append('circle')
      .attr('r', 10)
      .attr('fill', 'red');

		simulation
      .nodes(this.state.nodes)
      .on('tick', ticked);

		simulation.force('link')
				.links(this.state.links);

		function ticked() {
			// update the line end and circle render positions to their new
			// positions resulting from this tick of force calculations
			link
					.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return d.target.x; })
					.attr('y2', function(d) { return d.target.y; });

			node
					.attr('transform', function(d) {
						return 'translate(' + d.x + ',' + d.y + ')';
					})
		}

  }

  componentDidMount() {
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
    console.log('A name was submitted: ' + this.state.value);
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
      source: '',
      target: '',
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
          Edge to:
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
