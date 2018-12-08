import React from 'react';

export default class EditNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.getSelectedNodeText()
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    this.props.updateNodeText(this.props.selected.nodeId, this.state.value);
    event.preventDefault();
  }

  handleDelete(event) {
    this.props.removeNode(this.props.selected.nodeId);
    this.props.deselect();
    event.preventDefault();
  }

  getSelectedNodeText() {
    const idx = this.props.nodes.findIndex(e => e.id === this.props.selected.nodeId);
    if (idx === -1) {
      return '';
    }
    return this.props.nodes[idx].text;
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Edit Node:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Save" />
        <button onClick={this.handleDelete}>Delete</button>
      </form>
    );
  }
}
