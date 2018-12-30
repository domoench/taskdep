import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import styles from './nodeForm.module.css';

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
    const { classes } = this.props;
    return (
      <form className={styles.nodeform}>
        <div className={styles.flex}>
          <TextField
            id="nodeForm"
            label="Name"
            value={value}
            onChange={this.handleChange}
            className={classes.textField}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={this.handleSubmit}
            className={classes.button}
          >
            Submit
          </Button>
        </div>
      </form>
    );
  }
}

NodeForm.propTypes = {
  addNode: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(NodeForm);
