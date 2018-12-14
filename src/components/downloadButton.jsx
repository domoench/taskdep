import React from 'react';
import FileSaver from 'file-saver';
import { nodesShape, linksShape } from '../props';

const DownloadButton = ({ nodes, links }) => {
  const downloadGraph = () => {
    const jsonStr = JSON.stringify({ nodes, links });
    const blob = new Blob([jsonStr], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'graph.json');
  };

  return (
    <button type="button" onClick={downloadGraph}>Download</button>
  );
};

DownloadButton.propTypes = {
  nodes: nodesShape.isRequired,
  links: linksShape.isRequired,
};

export default DownloadButton;
