import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Overlay,
  Dialog,
  OutcomeBadge,
  Title,
  Message,
  ActionButton,
} from './GameResultModal.styles.js';
import { requestRestartGame } from '@/store/slices/socketThunks.js';
import { deriveGameResultState } from '@/utils/gameResult.js';

const GameResultModal = ({
  outcome,
  onConfirm,
  isOwner,
  placement = 'page',
  canSpectate = false,
  isGameOver = false,
  onSpectate,
}) => {
  const viewState = useMemo(
    () =>
      deriveGameResultState({
        outcome,
        isOwner,
        isGameOver,
        canSpectate,
        onSpectate,
      }),
    [outcome, isOwner, isGameOver, canSpectate, onSpectate]
  );

  const handleRestart = () => {
    requestRestartGame();
  };

  return (
    <Overlay role="presentation" $scope={placement}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-result-title"
      >
        <OutcomeBadge $variant={viewState.variant}>
          {viewState.variant.badge}
        </OutcomeBadge>
        <Title id="game-result-title">{viewState.variant.title}</Title>
        <Message>{viewState.message}</Message>
        {viewState.waitingMessageVisible && (
          <Message>Waiting for host...</Message>
        )}
        {viewState.restartVisible && (
          <ActionButton type="button" onClick={handleRestart}>
            Restart Game
          </ActionButton>
        )}
        {viewState.spectateEnabled && (
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
  isGameOver: PropTypes.bool,
  onSpectate: PropTypes.func,
};

export default GameResultModal;
