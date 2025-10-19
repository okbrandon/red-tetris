import PropTypes from 'prop-types';
import {
  Overlay,
  Dialog,
  OutcomeBadge,
  Title,
  Message,
  ActionButton,
} from './GameResultModal.styled.js';
import { requestRestartGame } from '../features/socket/socketThunks.js';

const VARIANTS = {
  win: {
    badge: 'Victory',
    title: 'You Won!',
    color: '#4ade80',
    background: 'rgba(74, 222, 128, 0.18)',
    shadow: '0 16px 28px rgba(74, 222, 128, 0.28)',
    defaultMessage: 'You outlasted every challenger. Nicely stacked!',
  },
  lose: {
    badge: 'Defeat',
    title: 'Game Over',
    color: '#f87171',
    background: 'rgba(248, 113, 113, 0.16)',
    shadow: '0 16px 28px rgba(248, 113, 113, 0.28)',
    defaultMessage: 'Another chance awaits. Shake it off and try again.',
  },
  info: {
    badge: 'Game Over',
    title: 'Game Finished',
    color: '#c4b5fd',
    background: 'rgba(196, 181, 253, 0.16)',
    shadow: '0 16px 28px rgba(196, 181, 253, 0.26)',
    defaultMessage: 'The match has ended. Thanks for playing!',
  },
};

const GameResultModal = ({
  outcome,
  onConfirm,
  isOwner,
  placement = 'page',
  canSpectate = false,
  isGameOver = false,
  onSpectate,
}) => {
  const variant =
    outcome && Object.prototype.hasOwnProperty.call(VARIANTS, outcome.outcome)
      ? VARIANTS[outcome.outcome]
      : VARIANTS.info;

  const handleRestart = () => {
    requestRestartGame();
  };

  return (
    <Overlay role="presentation" $scope={placement}>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="game-result-title">
        <OutcomeBadge $variant={variant}>{variant.badge}</OutcomeBadge>
        <Title id="game-result-title">Game Over</Title>
        <Message>{outcome?.message || 'Game Over'}</Message>
        {!isOwner && isGameOver && <Message>Waiting for host...</Message>}
        {isOwner && isGameOver && (
          <ActionButton type="button" onClick={handleRestart}>
            Restart Game
          </ActionButton>
        )}
        {canSpectate && typeof onSpectate === 'function' && (
          <ActionButton type="button" onClick={onSpectate}>
            Spectate Match
          </ActionButton>
        )}
        <ActionButton type="button" onClick={onConfirm}>
          Return to Menu
        </ActionButton>
      </Dialog>
    </Overlay>
  );
};

GameResultModal.propTypes = {
  outcome: PropTypes.shape({
    outcome: PropTypes.string,
    message: PropTypes.string,
  }),
  onConfirm: PropTypes.func.isRequired,
  isOwner: PropTypes.bool,
  placement: PropTypes.oneOf(['page', 'board']),
  canSpectate: PropTypes.bool,
  onSpectate: PropTypes.func,
};

export default GameResultModal;
