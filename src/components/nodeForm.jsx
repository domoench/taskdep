import React from 'react';
import PropTypes from 'prop-types';

class NodeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { value } = this.state;
    const { addNode } = this.props;
    addNode(value);
  }

  render() {
    const { value } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="nodeForm">
          New Task:
          <input type="text" id="nodeForm" value={value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

NodeForm.propTypes = {
  addNode: PropTypes.func.isRequired,
};

export default NodeForm;
