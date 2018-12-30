import React from 'react';
import PropTypes from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { nodesShape } from '../props';
import styles from './linkForm.module.css';

// Material UI overrides
const muiStyles = {
  select: {
    width: '140px',
  },
};

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
    const { nodes, classes } = this.props;
    const { source, target } = this.state;
    return (
      <form className={styles.linkform}>
        <FormControl>
          <InputLabel htmlFor="linkSource">Task 1</InputLabel>
          <Select
            value={source}
            onChange={this.handleSourceChange}
            inputProps={{
              name: 'source',
              id: 'linkSource',
            }}
            className={classes.select}
          >
            {
              nodes.map(node => (
                <MenuItem key={node.id} value={node.id}>{node.text}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
        <Typography variant="body1">before</Typography>
        <FormControl>
          <InputLabel htmlFor="linkTarget">Task 2</InputLabel>
          <Select
            value={target}
            onChange={this.handleTargetChange}
            inputProps={{
              name: 'target',
              id: 'linkTarget',
            }}
            className={classes.select}
          >
            {
              nodes.map(node => (
                <MenuItem key={node.id} value={node.id}>{node.text}</MenuItem>
              ))
            }
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          color="primary"
          onClick={this.handleSubmit}
        >
          Submit
        </Button>
      </form>
    );
  }
}

LinkForm.propTypes = {
  nodes: nodesShape.isRequired,
  addLink: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(LinkForm);
