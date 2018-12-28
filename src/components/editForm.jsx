import React from 'react';
import EditNode from './editNode';
import EditLink from './editLink';

const EditForm = (props) => {
  const { selected } = props;
  const nodeIsSelected = selected.nodeId !== '';
  const linkIsSelected = selected.linkId !== '';
  if(!nodeIsSelected && !linkIsSelected) {
    return null;
  } else {
    return (
      <div className="col-6">
        <div className="editform control">
          {nodeIsSelected
            && <EditNode {...props} />
          }
          {linkIsSelected
            && <EditLink {...props} />
          }
        </div>
      </div>
    );
  }
};

export default EditForm;
