import React from 'react';
import uuidv4 from 'uuid/v4';
import { select, event } from 'd3-selection';
import { zoom } from 'd3-zoom';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
} from 'd3-force';
import { cloneDeep, filter } from 'lodash';
import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import EditForm from './editForm';
import AddForm from './addForm';
import DownloadButton from './downloadButton';
import UploadButton from './uploadButton';
import nodeWeights from '../graph';
import styles from './app.module.css';

const width = 970;
const height = 600;

const primaryColor = '#006064';
const secondaryColor = '#f57c00';
const theme = createMuiTheme({
  palette: {
    primary: { main: primaryColor },
    secondary: { main: secondaryColor },
  },
  typography: { useNextVariants: true },
});

// style selector
const ss = className => `.${className}`;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.appRef = React.createRef();
    this.addNode = this.addNode.bind(this);
    this.removeNode = this.removeNode.bind(this);
    this.removeLink = this.removeLink.bind(this);
    this.deselect = this.deselect.bind(this);
    this.addLink = this.addLink.bind(this);
    this.loadGraphState = this.loadGraphState.bind(this);
    this.updateNodeText = this.updateNodeText.bind(this);
    this.state = {
      nodes: [],
      links: [],
      selected: { nodeId: '', linkId: '' }, // can be nothing, a node, or a link
    };
  }

  componentDidMount() {
    // Perform d3 setup that only needs to happen once
    const g = select(ss(styles.graphviz)).append('g');
    // Arrow marker def
    g.append('svg:defs').append('svg:marker')
      .attr('id', styles.arrow)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 18)
      .attr('refY', 5)
      .attr('markerWidth', 4)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z');

    g.append('g').attr('class', styles.links);
    g.append('g').attr('class', styles.nodes);

    this.renderGraph();
  }

  componentDidUpdate() {
    this.renderGraph();
  }

  addNode(text) {
    const { nodes } = this.state;
    this.setState({ nodes: [...nodes.slice(), { id: uuidv4(), text }] });
  }

  addLink(source, target) {
    const { links } = this.state;
    this.setState({ links: [...links.slice(), { source, target }] });
  }

  selectNode(nodeId, d3Nodes) {
    this.setState({
      nodes: cloneDeep(d3Nodes), // Persist x,y,vx,vy info so graph doesn't jump
      selected: { nodeId, linkId: '' },
    });
  }

  selectLink(linkId, d3Nodes) {
    this.setState({
      nodes: cloneDeep(d3Nodes), // Persist x,y,vx,vy info so graph doesn't jump
      selected: { nodeId: '', linkId },
    });
  }

  loadGraphState(nodes, links) {
    this.deselect();
    this.setState({ nodes, links });
  }

  // Returns the index of the node with the given Id
  findNodeIdx(nodeId) {
    const { nodes } = this.state;
    const i = nodes.findIndex(e => e.id === nodeId);
    if (i === -1) {
      // TODO: Learn idiomatic way of error handling in JS
      throw new Error(`node ${nodeId} not found`);
    }
    return i;
  }

  updateNodeText(nodeId, text) {
    const { nodes } = this.state;
    const i = this.findNodeIdx(nodeId);
    const node = nodes[i];

    // Update the text
    const updatedNode = {
      id: node.id, text, x: node.x, y: node.y, vx: node.vx, vy: node.vy,
    };
    this.setState({ nodes: cloneDeep([...nodes.slice(0, i), updatedNode, ...nodes.slice(i + 1)]) });
  }

  removeNode(nodeId) {
    const { nodes, links } = this.state;
    const i = this.findNodeIdx(nodeId);

    // Returns true if a link doesn't reference the nodeId
    const linkDoesntRefNode = l => l.target !== nodeId && l.source !== nodeId;

    this.setState({
      links: cloneDeep(filter(links, linkDoesntRefNode)),
      nodes: cloneDeep([...nodes.slice(0, i), ...nodes.slice(i + 1)]),
    });
  }

  removeLink(linkId) {
    const { selected, links } = this.state;
    const ends = selected.linkId.split('|');
    const i = links.findIndex(d => d.source === ends[0] && d.target === ends[1]);
    if (i === -1) {
      // TODO: Learn idiomatic way of error handling in JS
      throw new Error(`link ${linkId} not found`);
    }

    this.setState({
      links: cloneDeep([...links.slice(0, i), ...links.slice(i + 1)]),
    });
  }

  deselect() {
    this.setState({ selected: { nodeId: '', linkId: '' } });
  }

  /* Many ideas learned from
   *   https://beta.observablehq.com/@mbostock/d3-force-directed-graph
   *   http://bl.ocks.org/rkirsling/5001347
   *
   * TODO
   * - Document somewhere: the differences between react-maintained and d3 maintained
   *   nodes/links. e.g. in react links refer to node IDs, while in d3 links refer to
   *   node objects.
   * - Should probably break the d3 graph vizualization logic to its own component
   *   separate from the app. At that point the amount of state being managed may warrent
   *   Redux.
   */
  renderGraph() {
    const { selected, nodes: inNodes, links: inLinks } = this.state;

    // Always pass clones of the nodes + links to d3 so it doesn't modify react state
    const nodes = cloneDeep(inNodes);
    const links = cloneDeep(inLinks);

    // Calculate node weights
    const weights = nodeWeights(nodes, links);
    for (let i = 0; i < nodes.length; i += 1) {
      nodes[i].weight = weights[i];
    }

    // Set up zoom + pan
    const svg = select(ss(styles.graphviz));
    const g = svg.select('g');
    svg.call(zoom().on('zoom', () => {
      g.attr('transform', event.transform);
    }));

    // Custom y-axis layout force based on weight to serve as a basic topological sort
    // Uses node weight to target a y position so heavier nodes (those with more dependencies
    // downstream) rise to the top.
    const weightLayout = (alpha) => {
      for (let i = 0; i < nodes.length; i += 1) {
        const k = alpha * 0.05;
        const node = nodes[i];

        // Weight is assumed in range [0,1]. Invert because we want heavy nodes at top.
        const w = 1 - node.weight;

        // y position target based on weight.
        // Map weight range to screen height range (with some padding)
        const pad = 0.05;
        const yMin = height * pad;
        const yMax = height * (1 - pad);
        const yRange = yMax - yMin;
        const yTarget = (w * yRange) + yMin;

        // Speed towards target position proportional to distance from target
        const dY = yTarget - node.y;
        node.vy += dY * k;
      }
    };

    const simulation = forceSimulation()
      .force('link', forceLink().id(d => d.id).strength(0.99).distance(1))
      .force('charge', forceManyBody().strength(-100))
      .force('center', forceCenter(width / 2, height / 2))
      .force('updown', weightLayout);

    // LINKS
    // Link data bind
    let link = g.select(ss(styles.links))
      .selectAll('line')
      .data(links, d => `${d.source}|${d.target}`);

    // Link exit
    link.exit().remove();

    // Link enter
    const linkEnter = link.enter().append('line');

    // Link enter + update
    link = linkEnter.merge(link)
      .attr('marker-end', `url(#${styles.arrow})`)
      .attr('stroke', theme.palette.primary.main)
      .classed(styles.selected, d => `${d.source}|${d.target}` === selected.linkId)
      .on('click', (d) => {
        const linkId = `${d.source.id}|${d.target.id}`; // TODO why does d reference node objects here
        this.selectLink(linkId, simulation.nodes());
      });

    // NODES: Each node has an svg group containing a circle + a text label
    // Node group data bind
    let node = g.select(ss(styles.nodes)).selectAll('g').data(nodes, d => d.id);

    // Node group exit
    node.exit().remove();

    // Node group enter
    const nodeEnter = node.enter().append('g');

    // Circle enter
    nodeEnter.append('circle');

    // Label enter
    nodeEnter.append('text');

    // Enter + update on node group
    node = nodeEnter.merge(node);

    // Circle enter + update on circles
    const primColor = theme.palette.primary.light;
    const secColor = theme.palette.secondary.light;
    node.select('circle')
      .attr('r', 9)
      .attr('stroke', d => (d.id === selected.nodeId ? primColor : secColor))
      .on('click', (d) => {
        this.selectNode(d.id, simulation.nodes());
      });

    // Label enter + update
    node.select('text')
      .text(d => d.text)
      .attr('x', 10)
      .attr('y', -5);

    // Updates the line end and circle render positions to their new positions
    // resulting from this tick of force calculations
    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    }

    // Bind data to simulation
    simulation
      .nodes(nodes)
      .on('tick', ticked);

    simulation.force('link')
      .links(links)
      .distance(100);
  }

  render() {
    const { nodes, links, selected } = this.state;
    return (
      <MuiThemeProvider theme={theme}>
        <div className={styles.container}>
          <Typography variant="h1">
            TaskDep
          </Typography>

          {/* classnames d3 needs to refer to aren't generated by css modules */}
          <svg width={width} height={height} className={styles.graphviz} ref={this.appRef} />

          <div className={styles.controls}>
            <Grid container spacing={8}>
              <Grid item xs={6}>
                <Paper>
                  <AddForm
                    nodes={nodes}
                    links={links}
                    addNode={this.addNode}
                    addLink={this.addLink}
                  />
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper>
                  <EditForm
                    key={selected.nodeId} // Need key so selecting new node re-renders EditForm
                    updateNodeText={this.updateNodeText}
                    removeNode={this.removeNode}
                    removeLink={this.removeLink}
                    deselect={this.deselect}
                    selected={selected}
                    nodes={nodes}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <div className={styles.filebuttons}>
                  <div className={styles.filebutton}>
                    <DownloadButton {...this.state} />
                  </div>
                  <div className={styles.filebutton}>
                    <UploadButton loadGraphState={this.loadGraphState} />
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
