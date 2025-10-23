import propTypes from 'prop-types';

export const resultModalShape = propTypes.shape({
  isOpen: propTypes.bool.isRequired,
  outcome: propTypes.object.isRequired,
  onConfirm: propTypes.func.isRequired,
  isOwner: propTypes.bool.isRequired,
  canSpectate: propTypes.bool.isRequired,
  onSpectate: propTypes.func.isRequired,
  isGameOver: propTypes.bool.isRequired,
});
