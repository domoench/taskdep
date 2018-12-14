import React from 'react';
import PropTypes from 'prop-types';
import { selectedShape } from '../props';

class EditLink extends React.Component {
  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete(event) {
    const { removeLink, deselect, selected } = this.props;
    removeLink(selected.linkId);
    deselect();
    event.preventDefault();
  }

  render() {
    const { selected } = this.props;
    const nodeIds = selected.linkId.split('|');
    return (
      <div>
        <p>
          {nodeIds[0]}
          ↠
          {nodeIds[1]}
        </p>
        <button type="button" onClick={this.handleDelete}>Delete</button>
      </div>
    );
  }
}

EditLink.propTypes = {
  selected: selectedShape.isRequired,
  removeLink: PropTypes.func.isRequired,
  deselect: PropTypes.func.isRequired,
};

export default EditLink;
