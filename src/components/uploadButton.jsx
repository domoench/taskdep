import React from 'react';
import PropTypes from 'prop-types';

const UploadButton = ({ loadGraphState }) => {
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
    <input type="file" onChange={handleChange} />
  );
};

UploadButton.propTypes = {
  loadGraphState: PropTypes.func.isRequired,
};

export default UploadButton;
