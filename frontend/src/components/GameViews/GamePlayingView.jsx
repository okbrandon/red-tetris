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
  PreviewSection,
  PrimaryPreviewCard,
  PrimaryPreviewInfo,
  PreviewTitle,
  PreviewMeta,
  PrimaryPreviewCanvas,
  QueueList,
  QueueListItem,
  QueueIndex,
  QueuePreview,
  QueuePieceLabel,
  EmptyQueue,
  EventLogList,
  EventLogItem,
  EventLogHeader,
  EventLogScorer,
  EventLogTimestamp,
  EventLogMessage,
  EventLogDetails,
} from './GameView.styles.js';
import { resultModalShape } from '../GameResultModal/GameResultModal.propTypes.js';

const GamePlayingView = ({
  resultModal,
  grid,
  score,
  nextPieces,
  lineClearLog,
}) => {
  const primaryPreviewSize = Math.max(12, Math.floor(CELL_SIZE * 0.38));
  const queuePreviewSize = Math.max(10, Math.floor(CELL_SIZE * 0.3));
  const isResultModalOpen = Boolean(resultModal?.isOpen);
  const resolvedScore = typeof score === 'number' ? score : 0;
  const upcomingPieces = Array.isArray(nextPieces) ? nextPieces : [];
  const lineClears = Array.isArray(lineClearLog) ? lineClearLog : [];

  usePieceControls({ isResultModalOpen });

  const primaryPiece = upcomingPieces[0] ?? null;
  const queuePieces = upcomingPieces.slice(1, 4);

  const formatPieceLabel = (piece) => {
    if (!piece) return null;
    const rawLabel =
      (typeof piece.displayName === 'string' && piece.displayName.trim()) ||
      (typeof piece.name === 'string' && piece.name.trim()) ||
      (typeof piece.type === 'string' && piece.type.trim()) ||
      null;

    return rawLabel ? rawLabel.toUpperCase() : null;
  };
  const primaryLabel = formatPieceLabel(primaryPiece);
  const formatTimestamp = (rawValue) => {
    if (rawValue === null || rawValue === undefined) return null;
    let numericValue = null;

    if (rawValue instanceof Date) {
      numericValue = rawValue.getTime();
    } else if (typeof rawValue === 'number') {
      numericValue = rawValue;
    } else if (typeof rawValue === 'string') {
      const parsed = Date.parse(rawValue);
      if (Number.isNaN(parsed)) return null;
      numericValue = parsed;
    } else {
      const coerced = Number(rawValue);
      if (!Number.isFinite(coerced)) return null;
      numericValue = coerced;
    }

    if (!Number.isFinite(numericValue)) return null;

    const date = new Date(numericValue);
    if (Number.isNaN(date.getTime())) return null;

    return {
      label: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      dateTime: date.toISOString(),
    };
  };

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
          <PanelTitle>Game in Progress</PanelTitle>
          <PanelCaption>Stay sharp, stack the neon skyline.</PanelCaption>
        </PanelHeading>

        <InfoCard aria-label="Score overview">
          <InfoLabel>Score</InfoLabel>
          <ScoreValue>{resolvedScore}</ScoreValue>
        </InfoCard>

        <InfoCard aria-label="Upcoming pieces">
          <InfoLabel>Next Pieces</InfoLabel>
          {primaryPiece ? (
            <PreviewSection>
              <PrimaryPreviewCard>
                <PrimaryPreviewInfo>
                  <PreviewTitle>Up Next</PreviewTitle>
                  {primaryLabel ? (
                    <PreviewMeta>{primaryLabel}</PreviewMeta>
                  ) : null}
                </PrimaryPreviewInfo>
                <PrimaryPreviewCanvas>
                  <NextPiecePreview
                    piece={primaryPiece}
                    cellSize={primaryPreviewSize}
                  />
                </PrimaryPreviewCanvas>
              </PrimaryPreviewCard>

              {queuePieces.length ? (
                <QueueList aria-label="Queued pieces">
                  {queuePieces.map((piece, index) => {
                    const queueLabel = formatPieceLabel(piece);
                    const key = piece?.id ?? piece?.name ?? `queued-${index}`;

                    return (
                      <QueueListItem key={key}>
                        <QueueIndex title={`Queued position ${index + 2}`}>
                          +{index + 1}
                        </QueueIndex>
                        <QueuePreview>
                          <NextPiecePreview
                            piece={piece}
                            cellSize={queuePreviewSize}
                          />
                        </QueuePreview>
                        {queueLabel ? (
                          <QueuePieceLabel>{queueLabel}</QueuePieceLabel>
                        ) : null}
                      </QueueListItem>
                    );
                  })}
                </QueueList>
              ) : (
                <EmptyQueue>Queue is clear</EmptyQueue>
              )}
            </PreviewSection>
          ) : (
            <EmptyQueue>No preview available</EmptyQueue>
          )}
        </InfoCard>

        <InfoCard aria-label="Line clear log">
          <InfoLabel>Line Clears</InfoLabel>
          {lineClears.length ? (
            <EventLogList>
              {lineClears.map((entry) => {
                const scorerLabel =
                  typeof entry.scorer === 'string' && entry.scorer.trim()
                    ? entry.scorer.trim()
                    : null;
                const detailsLabel =
                  typeof entry.details === 'string' && entry.details.trim()
                    ? entry.details.trim()
                    : null;
                const timestamp = formatTimestamp(entry.timestamp);
                const headerNode =
                  scorerLabel || timestamp ? (
                    <EventLogHeader>
                      {scorerLabel ? (
                        <EventLogScorer title={scorerLabel}>
                          {scorerLabel}
                        </EventLogScorer>
                      ) : null}
                      {timestamp ? (
                        <EventLogTimestamp dateTime={timestamp.dateTime}>
                          {timestamp.label}
                        </EventLogTimestamp>
                      ) : null}
                    </EventLogHeader>
                  ) : null;
                const renderMessage = () => (
                  <EventLogMessage>{entry.message}</EventLogMessage>
                );
                const detailsNode = detailsLabel ? (
                  <EventLogDetails>{detailsLabel}</EventLogDetails>
                ) : null;

                if (!detailsNode) {
                  return (
                    <EventLogItem key={entry.id ?? entry.message}>
                      {headerNode}
                      {renderMessage()}
                    </EventLogItem>
                  );
                }

                return (
                  <EventLogItem key={entry.id ?? entry.message}>
                    {headerNode}
                    {renderMessage()}
                    {detailsNode}
                  </EventLogItem>
                );
              })}
            </EventLogList>
          ) : (
            <EmptyQueue>No line clears yet</EmptyQueue>
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
  lineClearLog: propTypes.arrayOf(
    propTypes.shape({
      id: propTypes.oneOfType([propTypes.string, propTypes.number]),
      message: propTypes.string.isRequired,
    })
  ),
};

export default GamePlayingView;
