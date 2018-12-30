import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import { selectedShape, nodesShape } from '../props';
import styles from './editNode.module.css';

// Material-UI overrides
const muiStyles = theme => (
  {
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 300,
    },
    button: {
      margin: theme.spacing.unit,
    },
  }
);

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
    const { classes } = this.props;
    const { value } = this.state;
    return (
      <form className={styles.editnode}>
        <TextField
          id="editNode"
          label="Edit Task"
          value={value}
          onChange={this.handleChange}
          margin="dense"
          className={classes.textField}
        />

        <Button
          variant="outlined"
          color="primary"
          onClick={this.handleSubmit}
          className={classes.button}
        >
          Save
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={this.handleDelete}
          className={classes.button}
        >
          Delete
        </Button>
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
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(EditNode);
