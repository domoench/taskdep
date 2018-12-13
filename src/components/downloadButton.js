import React from 'react';
import FileSaver from 'file-saver';

const DownloadButton = ({nodes, links}) => {
  const downloadGraph = () => {
    const jsonStr = JSON.stringify({nodes: nodes, links: links});
    const blob = new Blob([jsonStr], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "graph.json");
  }

  return (
    <button onClick={downloadGraph}>Download</button>
  )
}

export default DownloadButton;
