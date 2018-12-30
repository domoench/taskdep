import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import NodeForm from './nodeForm';
import LinkForm from './linkForm';
import { nodesShape, linksShape } from '../props';

const NODE = 0;
const LINK = 1;

class AddForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: NODE,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, value) {
    this.setState({ selected: value });
  }

  render() {
    const { selected } = this.state;
    const {
      addNode,
      addLink,
      nodes,
      links,
    } = this.props;

    return (
      <div>
        <AppBar position="static" color="primary">
          <Tabs
            value={selected}
            onChange={this.handleChange}
            fullWidth
          >
            <Tab label="Add Task" />
            <Tab label="Add Link" />
          </Tabs>
        </AppBar>
        {selected === NODE
          && <NodeForm addNode={addNode} />
        }
        {selected === LINK
          && <LinkForm key={nodes.length} nodes={nodes} links={links} addLink={addLink} />
        }
      </div>
    );
  }
}

AddForm.propTypes = {
  nodes: nodesShape.isRequired,
  links: linksShape.isRequired,
  addLink: PropTypes.func.isRequired,
  addNode: PropTypes.func.isRequired,
};

export default AddForm;
