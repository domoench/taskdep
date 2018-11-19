import { DataSet, Network } from 'vis';
import React from 'react';
import ReactDOM from 'react-dom';
import uuidv4 from 'uuid/v4';
import './index.css';

const options = {
  edges: {
    arrows: 'to',
    smooth: {
      type: 'cubicBezier',
      forceDirection: 'vertical',
      roundness: 0.4,
    },
  },
  layout: {
    hierarchical: {
      enabled: true,
      direction: 'UD',
      sortMethod: 'directed',
    },
  },
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.appRef = React.createRef();
    this.addNode = this.addNode.bind(this);
    this.addEdge = this.addEdge.bind(this);
    this.state = {
      nodes: [],
      edges: [],
    }
  }

  addNode(label) {
    this.setState({nodes: [...this.state.nodes, {id: uuidv4(), label: label}]});
  }

  addEdge(from, to) {
    this.setState({edges: [...this.state.edges, {from: from, to: to}]});
  }

  renderVisNetwork() {
    const { nodes, edges } = this.state;
    const data = {
      nodes: new DataSet([...nodes]),
      edges: new DataSet([...edges]),
    };
    this.network = new Network(this.appRef.current, data, options);
  }

  componentDidMount() {
    this.renderVisNetwork();
  }

  componentDidUpdate() {
    this.renderVisNetwork();
  }

  render() {
    const { nodes, edges } = this.state;
    return (
      <div>
        <div className="networkviz" ref={this.appRef} />
        <NodeForm addNode={this.addNode} />
        <EdgeForm nodes={nodes} edges={edges} addEdge={this.addEdge} />
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
      from: '',
      to: '',
    };
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleFromChange(event) {
    this.setState({from: event.target.value});
  }

  handleToChange(event) {
    this.setState({to: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.addEdge(this.state.from, this.state.to);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Edge from:
          <select value={this.state.from} onChange={this.handleFromChange}>
            {
              this.props.nodes.map(node  => (
                <option key={node.id} value={node.id}>{node.label}</option>
              ))
            }
          </select>
        </label>

        <label>
          Edge to:
          <select value={this.state.to} onChange={this.handleToChange}>
            {
              this.props.nodes.map(node  => (
                <option key={node.id} value={node.id}>{node.label}</option>
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
