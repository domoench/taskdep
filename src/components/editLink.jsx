import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { withStyles } from '@material-ui/core/styles';
import { selectedShape, nodesShape } from '../props';
import styles from './editLink.module.css';

// Material-UI overrides
const muiStyles = theme => (
  {
    typography: {
      width: 300,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.getContrastText(theme.palette.primary.light),
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[1],
      padding: '0.3em',
    },
  }
);

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
    const { selected, nodes, classes } = this.props;
    const nodeIds = selected.linkId.split('|');
    const i = nodes.findIndex(e => e.id === nodeIds[0]);
    const j = nodes.findIndex(e => e.id === nodeIds[1]);
    const sourceNode = nodes[i];
    const targetNode = nodes[j];

    return (
      <div className={styles.editlink}>
        <div className={styles.text}>
          <Typography
            variant="body1"
            className={classes.typography}
            align="center"
          >
            {sourceNode.text}
          </Typography>

          <ArrowForwardIcon />

          <Typography
            variant="body1"
            className={classes.typography}
            align="center"
          >
            {targetNode.text}
          </Typography>
        </div>
        <br />
        <Button
          variant="outlined"
          color="secondary"
          onClick={this.handleDelete}
        >
          Delete
        </Button>
      </div>
    );
  }
}

EditLink.propTypes = {
  nodes: nodesShape.isRequired,
  selected: selectedShape.isRequired,
  removeLink: PropTypes.func.isRequired,
  deselect: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(EditLink);
