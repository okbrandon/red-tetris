import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import TetrisGrid from '../TetrisGrid/TetrisGrid.jsx';
import { Subtitle } from '@/pages/UsernameSetupPage/UsernameSetupPage.styles.js';
import NextPiecePreview from '../NextPiecePreview/NextPiecePreview.jsx';
import { requestPieceMove } from '@/store/slices/socketThunks.js';
import {
  extractMoveDirection,
  shouldIgnoreForGameControls,
} from '@/utils/keyboard.js';
import { CELL_SIZE } from '@/utils/tetris.js';
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
} from './GameView.styles.js';

const GameView = ({ grid, resultModal }) => {
  const { currentPiece, nextPieces, score } = useSelector(
    (state) => state.game
  );
  const queue = nextPieces;

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

  const primaryPreviewSize = Math.max(16, Math.floor(CELL_SIZE * 0.6));
  const queuePreviewSize = Math.max(14, Math.floor(CELL_SIZE * 0.48));

  return (
    <Layout>
      <BoardArea>
        <BoardFrame>
          <TetrisGrid
            cellSize={CELL_SIZE}
            showGrid
            grid={grid}
            currentPiece={currentPiece}
          />
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
          {queue.length ? (
            <VerticalPreview>
              {queue.slice(0, 3).map((piece, index) => (
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

export default GameView;
