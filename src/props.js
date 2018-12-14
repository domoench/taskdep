import PropTypes from 'prop-types';

export const selectedShape = PropTypes.shape({
  nodeId: PropTypes.string.isRequired,
  linkId: PropTypes.string.isRequired,
});

export const nodesShape = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
}));

export const linksShape = PropTypes.arrayOf(PropTypes.shape({
  source: PropTypes.string.isRequired,
  target: PropTypes.string.isRequired,
}));
