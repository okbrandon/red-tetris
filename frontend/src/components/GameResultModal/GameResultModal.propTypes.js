import propTypes from 'prop-types';

export const resultModalShape = propTypes.shape({
  isOpen: propTypes.bool.isRequired,
  outcome: propTypes.string,
  onConfirm: propTypes.func.isRequired,
  isOwner: propTypes.bool,
  canSpectate: propTypes.bool,
  onSpectate: propTypes.func,
  isGameOver: propTypes.bool,
});

