import React from 'react';
import PropTypes from 'prop-types';
import Fab from '@material-ui/core/Fab';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { withStyles } from '@material-ui/core/styles';
import styles from './uploadButton.module.css';

// Material-UI overrides
const muiStyles = theme => (
  {
    button: {
      backgroundColor: theme.palette.secondary.light,
    },
  }
);

const UploadButton = ({ loadGraphState, classes }) => {
  const handleChange = (e) => {
    const f = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const g = JSON.parse(evt.target.result);
      // TODO: Handle parse errors
      loadGraphState(g.nodes, g.links);
    };
    reader.readAsText(f);
  };

  return (
    <div className={styles.uploadbutton}>
      <label htmlFor="contained-button-file">
        <input
          id="contained-button-file"
          type="file"
          onChange={handleChange}
          className={styles.input}
        />
        <Fab className={classes.button}>
          <CloudUploadIcon />
        </Fab>
      </label>
    </div>
  );
};

UploadButton.propTypes = {
  loadGraphState: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(muiStyles)(UploadButton);
