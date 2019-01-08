import React from 'react';
import Typography from '@material-ui/core/Typography';
import EditNode from './editNode';
import EditLink from './editLink';
import styles from './editForm.module.css';

const EditForm = (props) => {
  const { selected } = props;
  const nodeIsSelected = selected.nodeId !== '';
  const linkIsSelected = selected.linkId !== '';

  return (
    <div className={styles.editform}>
      {(!nodeIsSelected && !linkIsSelected)
        && <Typography align="center" variant="caption">Select a node or link in the graph to edit or delete it.</Typography>
      }
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
