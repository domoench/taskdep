import React from 'react';
import EditNode from './editNode.js'
import EditLink from './editLink.js'

const EditForm = (props) => {
  const { selected } = props;
  const nodeIsSelected = selected.nodeId !== '';
  const linkIsSelected = selected.linkId !== '';
  return (
    <div className='editform'>
      {nodeIsSelected &&
        <EditNode {...props} />
      }
      {linkIsSelected &&
        <EditLink {...props} />
      }
    </div>
  )
}

export default EditForm;

