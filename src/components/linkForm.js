import React from 'react';

export default class LinkForm extends React.Component {
  constructor(props) {
    super(props);
    const nodes = this.props.nodes;
    this.state = {
      source: nodes.length ? nodes[0].id : '',
      target: nodes.length ? nodes[0].id : '',
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
    this.props.addLink(this.state.source, this.state.target);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Link Source:
          <select value={this.state.source} onChange={this.handleSourceChange}>
            {
              this.props.nodes.map(node  => (
                <option key={node.id} value={node.id}>{node.text}</option>
              ))
            }
          </select>
        </label>

        <label>
          Link Target:
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

