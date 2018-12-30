import React from 'react';
import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import Fab from '@material-ui/core/Fab';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { withStyles } from '@material-ui/core/styles';
import { nodesShape, linksShape } from '../props';

// Material-UI overrides
const muiStyles = theme => (
  {
    button: {
      backgroundColor: theme.palette.secondary.light,
    },
  }
);

const DownloadButton = ({ nodes, links, classes }) => {
  const downloadGraph = () => {
    const jsonStr = JSON.stringify({ nodes, links });
    const blob = new Blob([jsonStr], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'graph.json');
  };

  return (
    <Fab className={classes.button} onClick={downloadGraph}>
      <CloudDownloadIcon />
    </Fab>
  );
};

DownloadButton.propTypes = {
  nodes: nodesShape.isRequired,
  links: linksShape.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(DownloadButton);
