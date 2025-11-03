import { useMemo } from 'react';
import propTypes from 'prop-types';
import TetrisGrid from '../TetrisGrid/TetrisGrid.jsx';
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
  EmptyQueue,
  EventLogList,
  EventLogItem,
  EventLogHeader,
  EventLogScorer,
  EventLogTimestamp,
  EventLogMessage,
  EventLogDetails,
  SpectatorActions,
  ExitButton,
} from './GameView.styles.js';

const FocusedSpectatorView = ({
  grid,
  focusedPlayer,
  leaveRoom,
  lineClearLog,
}) => {
  const playerName =
    focusedPlayer?.username?.trim() || focusedPlayer?.name?.trim() || 'Player';
  const resolvedScore = useMemo(() => {
    if (!focusedPlayer) return 0;
    const statsScore = focusedPlayer?.stats?.score;
    if (typeof statsScore === 'number') return statsScore;
    return typeof focusedPlayer?.score === 'number' ? focusedPlayer.score : 0;
  }, [focusedPlayer]);

  const lineClears = Array.isArray(lineClearLog) ? lineClearLog : [];
  const hasFocusedPlayer = Boolean(focusedPlayer);
  const formatTimestamp = (rawValue) => {
    if (rawValue === null || rawValue === undefined) return null;
    const numericValue =
      typeof rawValue === 'number' ? rawValue : Number(rawValue);
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
        </BoardFrame>
      </BoardArea>
      <PanelArea>
        <PanelHeading>
          <PanelTitle>
            {hasFocusedPlayer ? `Spectating ${playerName}` : 'Spectating'}
          </PanelTitle>
          <PanelCaption>
            {hasFocusedPlayer
              ? 'Keep an eye on their score surge.'
              : 'Select a player to begin spectating.'}
          </PanelCaption>
        </PanelHeading>

        <InfoCard aria-label="Focused player score">
          <InfoLabel>Score</InfoLabel>
          <ScoreValue>{resolvedScore}</ScoreValue>
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

                return (
                  <EventLogItem key={entry.id ?? entry.message}>
                    {scorerLabel || timestamp ? (
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
                    ) : null}
                    <EventLogMessage>{entry.message}</EventLogMessage>
                    {detailsLabel ? (
                      <EventLogDetails>{detailsLabel}</EventLogDetails>
                    ) : null}
                  </EventLogItem>
                );
              })}
            </EventLogList>
          ) : (
            <EmptyQueue>No line clears yet</EmptyQueue>
          )}
        </InfoCard>

        <SpectatorActions>
          <ExitButton type="button" onClick={leaveRoom}>
            Leave Game
          </ExitButton>
        </SpectatorActions>
      </PanelArea>
    </Layout>
  );
};

FocusedSpectatorView.propTypes = {
  grid: propTypes.arrayOf(propTypes.array).isRequired,
  focusedPlayer: propTypes.object,
  leaveRoom: propTypes.func,
  lineClearLog: propTypes.arrayOf(
    propTypes.shape({
      id: propTypes.oneOfType([propTypes.string, propTypes.number]),
      message: propTypes.string,
    })
  ),
};

export default FocusedSpectatorView;
