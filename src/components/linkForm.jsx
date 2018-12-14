import React from 'react';
import PropTypes from 'prop-types';
import { nodesShape } from '../props';

class LinkForm extends React.Component {
  constructor(props) {
    super(props);
    const { nodes } = this.props;
    this.state = {
      source: nodes.length ? nodes[0].id : '',
      target: nodes.length ? nodes[0].id : '',
    };
    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSourceChange(event) {
    this.setState({ source: event.target.value });
  }

  handleTargetChange(event) {
    this.setState({ target: event.target.value });
  }

  handleSubmit(event) {
    const { source, target } = this.state;
    const { addLink } = this.props;
    addLink(source, target);
    event.preventDefault();
  }

  render() {
    const { nodes } = this.props;
    const { source, target } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="linkSource">
          Link Source:
          <select value={source} id="linkSource" onChange={this.handleSourceChange}>
            {
              nodes.map(node => (
                <option key={node.id} value={node.id}>{node.text}</option>
              ))
            }
          </select>
        </label>

        <label htmlFor="linkTarget">
          Link Target:
          <select value={target} id="linkTarget" onChange={this.handleTargetChange}>
            {
              nodes.map(node => (
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

LinkForm.propTypes = {
  nodes: nodesShape.isRequired,
  addLink: PropTypes.func.isRequired,
};

export default LinkForm;
