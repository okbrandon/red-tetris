import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import BackButton from '@/components/Backbutton/BackButton';
import {
  Wrapper,
  LogoTitle,
} from '../UsernameSetupPage/UsernameSetupPage.styles';
import {
  HistoryContainer,
  HistoryCard,
  HistoryHeader,
  HistoryTopRow,
  HistoryTitle,
  HistoryNote,
  HistorySubtitle,
  HistoryList,
  HistoryItem,
  HistoryItemHeader,
  HistoryOutcome,
  HistoryTimestamp,
  HistorySummary,
  HistoryMeta,
  HistoryMessage,
  HistoryEmpty,
} from './GameHistoryPage.styles';

const formatHistoryTimestamp = (rawValue) => {
  if (rawValue === null || rawValue === undefined) return null;
  if (rawValue instanceof Date) {
    return {
      label: rawValue.toLocaleString(),
      dateTime: rawValue.toISOString(),
    };
  }

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return formatHistoryTimestamp(new Date(rawValue));
  }

  if (typeof rawValue === 'string') {
    const parsed = Date.parse(rawValue);
    if (!Number.isNaN(parsed)) {
      return formatHistoryTimestamp(new Date(parsed));
    }
  }

  return null;
};

const deriveHistoryEntries = (history) => {
  if (!Array.isArray(history)) return [];

  return history.slice(0, 5).map((entry, index) => {
    const youSegment = entry?.you ?? {};
    const youId =
      youSegment?.id !== undefined && youSegment?.id !== null
        ? String(youSegment.id)
        : null;
    const hasLost = Boolean(youSegment?.hasLost);
    const youScore =
      typeof youSegment?.score === 'number' ? youSegment.score : null;

    const winnerId =
      entry?.winner?.id !== undefined && entry?.winner?.id !== null
        ? String(entry.winner.id)
        : null;

    let outcomeTone = 'neutral';
    let outcomeLabel = 'Completed';
    if (winnerId && youId) {
      if (winnerId === youId) {
        outcomeTone = 'win';
        outcomeLabel = 'Victory';
      } else {
        outcomeTone = 'loss';
        outcomeLabel = 'Defeat';
      }
    } else if (entry?.room?.soloJourney) {
      outcomeTone = hasLost ? 'loss' : 'neutral';
      outcomeLabel = hasLost ? 'Run Ended' : 'Solo Run';
    } else if (hasLost) {
      outcomeTone = 'loss';
      outcomeLabel = 'Defeat';
    }

    const message =
      typeof entry?.message === 'string' && entry.message.trim()
        ? entry.message.trim()
        : null;

    const roomMode =
      typeof entry?.room?.mode === 'string' && entry.room.mode.trim()
        ? entry.room.mode.trim()
        : entry?.room?.soloJourney
          ? 'Solo Journey'
          : null;

    const opponentsRaw = Array.isArray(entry?.clients) ? entry.clients : [];
    const filteredOpponents = opponentsRaw.filter((client) => {
      if (!client || typeof client !== 'object') return false;
      if (!youId) return true;
      return String(client.id ?? '') !== youId;
    });

    const opponentNames = filteredOpponents
      .map((client) => {
        if (typeof client.username === 'string' && client.username.trim()) {
          return client.username.trim();
        }
        if (
          client.id !== undefined &&
          client.id !== null &&
          String(client.id).trim()
        ) {
          return String(client.id).trim();
        }
        return null;
      })
      .filter(Boolean);

    let opponentLabel = null;
    if (opponentNames.length > 0) {
      const [first, second] = opponentNames;
      const extraCount = opponentNames.length - 2;
      opponentLabel =
        opponentNames.length === 1
          ? `vs ${first}`
          : `vs ${first}, ${second}${extraCount > 0 ? ` +${extraCount}` : ''}`;
    } else if (entry?.room?.soloJourney) {
      opponentLabel = 'Solo journey';
    }

    const scoreLabel =
      Number.isFinite(youScore) && youScore !== null
        ? `Score ${youScore.toLocaleString()}`
        : null;

    const summaryParts = [scoreLabel, roomMode].filter(Boolean);
    const summary = summaryParts.join(' • ') || null;

    const timestamp = formatHistoryTimestamp(entry?.timestamp);
    const historyKey =
      (typeof entry?.timestamp === 'string' && entry.timestamp) ||
      timestamp?.dateTime ||
      `${entry?.room?.id ?? 'room'}-${index}`;

    return {
      key: historyKey,
      outcomeLabel,
      outcomeTone,
      timestamp,
      summary,
      meta: opponentLabel,
      message,
    };
  });
};

const GameHistoryPage = () => {
  const navigate = useNavigate();
  const playerHistory = useSelector((state) => state.playerStats.history);
  const lastHistoryUpdate = useSelector(
    (state) => state.playerStats.lastUpdatedAt
  );

  const historyEntries = useMemo(
    () => deriveHistoryEntries(playerHistory),
    [playerHistory]
  );

  const lastUpdated = useMemo(
    () => formatHistoryTimestamp(lastHistoryUpdate),
    [lastHistoryUpdate]
  );

  const handleBack = () => {
    navigate('/menu');
  };

  return (
    <Wrapper>
      <BackButton onClick={handleBack} />
      <LogoTitle>Recent Games</LogoTitle>
      <HistoryContainer>
        <HistoryCard>
          <HistoryHeader>
            <HistoryTopRow>
              <HistoryTitle>Your Last Matches</HistoryTitle>
              {historyEntries.length > 0 && lastUpdated ? (
                <HistoryNote dateTime={lastUpdated.dateTime}>
                  Updated {lastUpdated.label}
                </HistoryNote>
              ) : null}
            </HistoryTopRow>
            <HistorySubtitle>
              Track how your last five games went across solo runs and
              multiplayer lobbies.
            </HistorySubtitle>
          </HistoryHeader>
          {historyEntries.length ? (
            <HistoryList>
              {historyEntries.map((entry) => (
                <HistoryItem key={entry.key}>
                  <HistoryItemHeader>
                    <HistoryOutcome data-outcome={entry.outcomeTone}>
                      {entry.outcomeLabel}
                    </HistoryOutcome>
                    {entry.timestamp ? (
                      <HistoryTimestamp dateTime={entry.timestamp.dateTime}>
                        {entry.timestamp.label}
                      </HistoryTimestamp>
                    ) : null}
                  </HistoryItemHeader>
                  {entry.summary ? (
                    <HistorySummary>{entry.summary}</HistorySummary>
                  ) : null}
                  {entry.meta ? <HistoryMeta>{entry.meta}</HistoryMeta> : null}
                  {entry.message ? (
                    <HistoryMessage>{entry.message}</HistoryMessage>
                  ) : null}
                </HistoryItem>
              ))}
            </HistoryList>
          ) : (
            <HistoryEmpty>No games recorded yet</HistoryEmpty>
          )}
        </HistoryCard>
      </HistoryContainer>
    </Wrapper>
  );
};

export default GameHistoryPage;
