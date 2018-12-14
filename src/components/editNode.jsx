import React from 'react';
import PropTypes from 'prop-types';
import { selectedShape, nodesShape } from '../props';

class EditNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.getSelectedNodeText(),
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  getSelectedNodeText() {
    const { selected, nodes } = this.props;
    const idx = nodes.findIndex(e => e.id === selected.nodeId);
    if (idx === -1) {
      return '';
    }
    return nodes[idx].text;
  }

  handleDelete(event) {
    const { removeNode, selected, deselect } = this.props;
    removeNode(selected.nodeId);
    deselect();
    event.preventDefault();
  }

  handleSubmit(event) {
    const { value } = this.state;
    const { updateNodeText, selected } = this.props;
    updateNodeText(selected.nodeId, value);
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    const { value } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="editNode">
          Edit Node:
          <input type="text" id="editNode" value={value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Save" />
        <button type="button" onClick={this.handleDelete}>Delete</button>
      </form>
    );
  }
}

EditNode.propTypes = {
  selected: selectedShape.isRequired,
  nodes: nodesShape.isRequired,
  updateNodeText: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
  deselect: PropTypes.func.isRequired,
};

export default EditNode;
