import propTypes from 'prop-types';
import TetrisGrid from '../TetrisGrid/TetrisGrid.jsx';
import NextPiecePreview from '../NextPiecePreview/NextPiecePreview.jsx';
import GameResultModal from '../GameResultModal/GameResultModal.jsx';
import { CELL_SIZE } from '@/utils/tetris.js';
import usePieceControls from '../../hooks/usePieceControls.js';
import {
  Layout,
  BoardArea,
  BoardFrame,
  PanelArea,
  PanelHeading,
  PanelTitle,
  PanelCaption,
  InfoCard,
  InfoLabel,
  ScoreValue,
  VerticalPreview,
  PreviewSlot,
  EmptyQueue,
} from './GameView.styles.js';
import { resultModalShape } from '../GameResultModal/GameResultModal.propTypes.js';

const GamePlayingView = ({ resultModal, grid, score, nextPieces }) => {
  const primaryPreviewSize = Math.max(16, Math.floor(CELL_SIZE * 0.6));
  const queuePreviewSize = Math.max(14, Math.floor(CELL_SIZE * 0.48));
  const isResultModalOpen = Boolean(resultModal?.isOpen);
  const resolvedScore = typeof score === 'number' ? score : 0;
  const upcomingPieces = Array.isArray(nextPieces) ? nextPieces : [];

  usePieceControls({ isResultModalOpen });

  return (
    <Layout>
      <BoardArea>
        <BoardFrame>
          <TetrisGrid showGrid grid={grid} />
          {isResultModalOpen && (
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
          <PanelTitle>Solo Journey</PanelTitle>
          <PanelCaption>Stay sharp, stack the neon skyline.</PanelCaption>
        </PanelHeading>

        <InfoCard aria-label="Score overview">
          <InfoLabel>Score</InfoLabel>
          <ScoreValue>{resolvedScore}</ScoreValue>
        </InfoCard>

        <InfoCard aria-label="Upcoming pieces">
          <InfoLabel>Next Pieces</InfoLabel>
          {upcomingPieces.length ? (
            <VerticalPreview>
              {upcomingPieces.slice(0, 3).map((piece, index) => (
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
  resultModal: resultModalShape.isRequired,
  grid: propTypes.arrayOf(propTypes.array).isRequired,
  score: propTypes.number,
  nextPieces: propTypes.arrayOf(propTypes.object),
};

export default GamePlayingView;
