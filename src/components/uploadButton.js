import React from 'react';

const UploadButton = ({loadGraphState}) => {
  const handleChange = (e) => {
    const f = e.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      const g = JSON.parse(e.target.result);
      // TODO: Handle parse errors
      loadGraphState(g.nodes, g.links);
    }
    reader.readAsText(f);
  }

  return (
    <input type="file" onChange={handleChange} />
  )
}

export default UploadButton;
