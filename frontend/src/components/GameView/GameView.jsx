import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import propTypes from 'prop-types';
import TetrisGrid from '../TetrisGrid/TetrisGrid.jsx';
import { Subtitle } from '@/pages/UsernameSetupPage/UsernameSetupPage.styles.js';
import NextPiecePreview from '../NextPiecePreview/NextPiecePreview.jsx';
import { requestPieceMove } from '@/store/slices/socketThunks.js';
import {
  extractMoveDirection,
  shouldIgnoreForGameControls,
} from '@/utils/keyboard.js';
import { CELL_SIZE, computeStats } from '@/utils/tetris.js';
import GameResultModal from '../GameResultModal/GameResultModal.jsx';
import {
  Layout,
  BoardArea,
  BoardFrame,
  PanelArea,
  PanelHeading,
  PanelCaption,
  InfoCard,
  InfoLabel,
  ScoreValue,
  VerticalPreview,
  PreviewSlot,
  EmptyQueue,
  ExitButton,
  FocusedStats,
  StatLabel,
  StatRow,
  StatValue,
  SpectatorActions,
} from './GameView.styles.js';

const GamePlayingView = ({ resultModal, grid }) => {
  const { score, nextPieces } = useSelector((state) => state.game);
  const primaryPreviewSize = Math.max(16, Math.floor(CELL_SIZE * 0.6));
  const queuePreviewSize = Math.max(14, Math.floor(CELL_SIZE * 0.48));

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};

    const handleKeyDown = (event) => {
      if (!event || shouldIgnoreForGameControls(event.target)) return;

      const direction = extractMoveDirection(event);
      if (!direction) return;

      event.preventDefault();
      requestPieceMove({ direction });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Layout>
      <BoardArea>
        <BoardFrame>
          <TetrisGrid showGrid grid={grid} />
          {resultModal.isOpen && (
            <GameResultModal
              outcome={resultModal.outcome}
              onConfirm={resultModal.onConfirm}
              isOwner={Boolean(resultModal.isOwner)}
              canSpectate={Boolean(resultModal.canSpectate)}
              onSpectate={resultModal.onSpectate}
              isGameOver={Boolean(resultModal.isGameOver)}
              placement="board"
            />
          )}
        </BoardFrame>
      </BoardArea>
      <PanelArea>
        <PanelHeading>
          <Subtitle as="h2" style={{ margin: 0 }}>
            Solo Journey
          </Subtitle>
          <PanelCaption>Stay sharp, stack the neon skyline.</PanelCaption>
        </PanelHeading>

        <InfoCard aria-label="Score overview">
          <InfoLabel>Score</InfoLabel>
          <ScoreValue>{score ?? 0}</ScoreValue>
        </InfoCard>

        <InfoCard aria-label="Upcoming pieces">
          <InfoLabel>Next Pieces</InfoLabel>
          {nextPieces.length ? (
            <VerticalPreview>
              {nextPieces.slice(0, 3).map((piece, index) => (
                <PreviewSlot key={piece?.id ?? piece?.name ?? `next-${index}`}>
                  <NextPiecePreview
                    piece={piece}
                    cellSize={
                      index === 0 ? primaryPreviewSize : queuePreviewSize
                    }
                  />
                </PreviewSlot>
              ))}
            </VerticalPreview>
          ) : (
            <EmptyQueue>No preview available</EmptyQueue>
          )}
        </InfoCard>
      </PanelArea>
    </Layout>
  );
};

GamePlayingView.propTypes = {
  resultModal: propTypes.shape({
    isOpen: propTypes.bool.isRequired,
    outcome: propTypes.string,
    onConfirm: propTypes.func.isRequired,
    isOwner: propTypes.bool,
    canSpectate: propTypes.bool,
    onSpectate: propTypes.func,
    isGameOver: propTypes.bool,
  }).isRequired,
  grid: propTypes.arrayOf(propTypes.array).isRequired,
};

const FocusedSpecter = ({ grid, focusedPlayer, leaveRoom }) => {
  const focusedStats = useMemo(
    () => computeStats(focusedPlayer),
    [focusedPlayer]
  );

  return (
    <Layout>
      <BoardArea>
        <BoardFrame>
          <TetrisGrid showGrid grid={grid} />
        </BoardFrame>
        {focusedStats.length > 0 && (
          <FocusedStats>
            {focusedStats.map(({ label, value }) => (
              <StatRow key={label}>
                <StatLabel>{label}</StatLabel>
                <StatValue>{value}</StatValue>
              </StatRow>
            ))}
          </FocusedStats>
        )}
      </BoardArea>
      <SpectatorActions>
        <ExitButton type="button" onClick={leaveRoom}>
          Leave Game
        </ExitButton>
      </SpectatorActions>
    </Layout>
  );
};

FocusedSpecter.propTypes = {
  grid: propTypes.arrayOf(propTypes.array).isRequired,
  focusedPlayer: propTypes.object,
  leaveRoom: propTypes.func,
};

const GameView = ({
  resultModal,
  grid,
  isPlaying,
  focusedPlayer,
  leaveRoom,
}) => {
  return isPlaying ? (
    <GamePlayingView resultModal={resultModal} grid={grid} />
  ) : (
    <FocusedSpecter
      grid={grid}
      focusedPlayer={focusedPlayer}
      leaveRoom={leaveRoom}
    />
  );
};

GameView.propTypes = {
  resultModal: propTypes.shape({
    isOpen: propTypes.bool.isRequired,
    outcome: propTypes.string,
    onConfirm: propTypes.func.isRequired,
    isOwner: propTypes.bool,
    canSpectate: propTypes.bool,
    onSpectate: propTypes.func,
    isGameOver: propTypes.bool,
  }),
  grid: propTypes.arrayOf(propTypes.array).isRequired,
  isPlaying: propTypes.bool,
  focusedPlayer: propTypes.object,
  leaveRoom: propTypes.func,
};

export default GameView;
