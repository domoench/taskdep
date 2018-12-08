import React from 'react';

export default class EditLink extends React.Component {
  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete(event) {
    this.props.removeLink(this.props.selected.linkId);
    this.props.deselect();
    event.preventDefault();
  }

  render() {
    const { selected } = this.props;
    const nodeIds = selected.linkId.split('|');
    return (
      <div>
        <p>{nodeIds[0]} ↠ {nodeIds[1]}</p>
        <button onClick={this.handleDelete}>Delete</button>
      </div>
    )
  }
}
