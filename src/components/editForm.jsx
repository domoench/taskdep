import React from 'react';
import EditNode from './editNode';
import EditLink from './editLink';

const EditForm = (props) => {
  const { selected } = props;
  const nodeIsSelected = selected.nodeId !== '';
  const linkIsSelected = selected.linkId !== '';
  return (
    <div className="editform">
      {nodeIsSelected
        && <EditNode {...props} />
      }
      {linkIsSelected
        && <EditLink {...props} />
      }
    </div>
  );
};

export default EditForm;
