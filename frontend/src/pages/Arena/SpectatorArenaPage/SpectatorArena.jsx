import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import TetrisGrid from '@/components/TetrisGrid/TetrisGrid.jsx';
import useResponsiveValue from '@/hooks/useResponsiveValue.js';
import {
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  deriveBoardDimensions,
} from '@/utils/tetris.js';
import {
  deriveCardScale,
  derivePreviewCellSize,
  estimateOpponentCellSize,
} from '@/utils/arenaSizing.js';
import { MAX_VISIBLE_SPECTERS } from '../MultiArenaPage/constants.js';
import {
  ArenaContainer as SpectatorContainer,
  ArenaLayout as SpectatorLayout,
  OpponentColumn as SpectatorColumn,
  OpponentGrid as SpectatorList,
  OpponentCard as SpectatorCard,
  OpponentHeader as SpectatorCardHeader,
  OpponentBadge as SpectatorBadge,
  OpponentName as SpectatorName,
  MiniBoard as SpectatorMiniBoard,
  MainColumn as SpectatorMain,
  SpectatorActions,
  ExitButton,
  FocusedPanel,
  FocusedHeader,
  FocusedBadge,
  FocusedName,
  FocusedBody,
  SpectatorBoardFrame,
  FocusedStats,
  StatRow,
  StatLabel,
  StatValue,
  EmptyState,
  SectionLabel,
  EmptyNotice,
} from './SpectatorArena.styles.js';

const computeFocusedCellSize = (rows = 20, cols = 10) => {
  if (typeof window === 'undefined') return 30;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const sidebarWidth = w >= 960 ? Math.min(Math.max(w * 0.36, 320), 420) : 0;
  const padding = w >= 960 ? 176 : 92;
  const availableWidth = Math.max(w - sidebarWidth - padding, 300);
  const maxByWidth = availableWidth / cols;
  const availableHeight = Math.max(h - 320, 320);
  const maxByHeight = availableHeight / rows;
  const raw = Math.floor(Math.min(maxByWidth, maxByHeight));
  return Math.max(18, Math.min(raw, 42));
};

const computeStats = (player) => {
  if (!player || typeof player !== 'object') return [];
  const stats = player.stats || {};

  const entries = [];
  const score = stats.score ?? player.score;
  if (typeof score === 'number') {
    entries.push({ label: 'Score', value: score });
  }
  const lines = stats.linesCleared ?? stats.lines ?? player.linesCleared;
  if (typeof lines === 'number') {
    entries.push({ label: 'Lines', value: lines });
  }
  const level = stats.level ?? player.level;
  if (typeof level === 'number') {
    entries.push({ label: 'Level', value: level });
  }

  return entries;
};

const SpectatorArena = ({ leaveRoom }) => {
  const { you, players: gamePlayers } = useSelector((state) => state.game);

  const players = Array.isArray(gamePlayers) ? gamePlayers : [];
  const opponents = useMemo(
    () => players.filter((player) => (you?.id ? player?.id !== you.id : true)),
    [players, you?.id]
  );
  const visibleOpponents = useMemo(
    () => opponents.slice(0, MAX_VISIBLE_SPECTERS),
    [opponents]
  );

  const [selectedId, setSelectedId] = useState(
    () => visibleOpponents[0]?.id ?? null
  );

  useEffect(() => {
    if (!visibleOpponents.length) {
      setSelectedId(null);
      return;
    }
    const firstId = visibleOpponents[0]?.id ?? null;
    const hasSelected =
      selectedId &&
      visibleOpponents.some((player) => player?.id === selectedId);
    if (!hasSelected && selectedId !== firstId) {
      setSelectedId(firstId);
    }
  }, [visibleOpponents, selectedId]);

  const focusedPlayer = useMemo(
    () =>
      visibleOpponents.find((player) => player?.id === selectedId) ??
      visibleOpponents[0] ??
      null,
    [visibleOpponents, selectedId]
  );

  const focusedBoard = Array.isArray(focusedPlayer?.specter)
    ? focusedPlayer.specter
    : [];
  const { rows, cols } = useMemo(
    () => deriveBoardDimensions(focusedBoard),
    [focusedBoard]
  );
  const safeRows = rows || 20;
  const safeCols = cols || 10;
  const focusedCellSize = useResponsiveValue(
    useCallback(
      () => computeFocusedCellSize(safeRows, safeCols),
      [safeRows, safeCols]
    )
  );
  const spectatorScale = useMemo(
    () => deriveCardScale(visibleOpponents.length),
    [visibleOpponents.length]
  );
  const focusedStats = useMemo(
    () => computeStats(focusedPlayer),
    [focusedPlayer]
  );
  const cardScaleStyle = useMemo(
    () => ({ '--card-scale': spectatorScale }),
    [spectatorScale]
  );

  return (
    <SpectatorContainer>
      <SpectatorLayout>
        <SpectatorColumn style={cardScaleStyle}>
          <SectionLabel>{`Opponents${
            visibleOpponents.length ? ` (${visibleOpponents.length})` : ''
          }`}</SectionLabel>
          {visibleOpponents.length ? (
            <SpectatorList aria-label="Players to spectate">
              {visibleOpponents.map((opponent, index) => {
                const miniBoard = Array.isArray(opponent?.specter)
                  ? opponent.specter
                  : [];
                const { rows: miniRows, cols: miniCols } =
                  deriveBoardDimensions(miniBoard);
                const ordinal = index + 1;
                const isActive = opponent?.id === focusedPlayer?.id;
                const previewCellSize = estimateOpponentCellSize({
                  opponentCount: visibleOpponents.length,
                });

                return (
                  <SpectatorCard
                    key={
                      opponent?.id || opponent?.username || `spectator-${index}`
                    }
                    data-active={isActive}
                    $interactive
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    onClick={() => setSelectedId(opponent?.id || null)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedId(opponent?.id || null);
                      }
                    }}
                  >
                    <SpectatorCardHeader>
                      <SpectatorBadge>{`Player ${ordinal}`}</SpectatorBadge>
                      <SpectatorName>
                        {opponent?.username ||
                          opponent?.name ||
                          `Player ${ordinal}`}
                      </SpectatorName>
                    </SpectatorCardHeader>
                    <SpectatorMiniBoard>
                      <TetrisGrid
                        rows={miniRows}
                        cols={miniCols}
                        cellSize={previewCellSize}
                        showGrid={false}
                        grid={miniBoard}
                      />
                    </SpectatorMiniBoard>
                  </SpectatorCard>
                );
              })}
            </SpectatorList>
          ) : (
            <EmptyNotice>No specters active yet.</EmptyNotice>
          )}
        </SpectatorColumn>

        <SpectatorMain>
          {!visibleOpponents.length ? (
            <FocusedPanel role="region" aria-label="Spectator focus panel">
              <FocusedHeader>
                <FocusedBadge>Watching</FocusedBadge>
                <FocusedName>No active opponents</FocusedName>
              </FocusedHeader>
              <EmptyState>No boards to watch right now.</EmptyState>
              {typeof leaveRoom === 'function' && (
                <SpectatorActions>
                  <ExitButton type="button" onClick={leaveRoom}>
                    Leave Game
                  </ExitButton>
                </SpectatorActions>
              )}
            </FocusedPanel>
          ) : (
            <FocusedPanel role="region" aria-label="Spectator focus panel">
              <FocusedHeader>
                <FocusedBadge>Watching</FocusedBadge>
                <FocusedName>
                  {focusedPlayer?.username || focusedPlayer?.name || 'Opponent'}
                </FocusedName>
              </FocusedHeader>
              <FocusedBody>
                <SpectatorBoardFrame>
                  <TetrisGrid
                    rows={rows}
                    cols={cols}
                    cellSize={focusedCellSize}
                    showGrid
                    grid={focusedBoard}
                  />
                </SpectatorBoardFrame>
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
              </FocusedBody>
              {typeof leaveRoom === 'function' && (
                <SpectatorActions>
                  <ExitButton type="button" onClick={leaveRoom}>
                    Leave Game
                  </ExitButton>
                </SpectatorActions>
              )}
            </FocusedPanel>
          )}
        </SpectatorMain>
      </SpectatorLayout>
    </SpectatorContainer>
  );
};

SpectatorArena.propTypes = {
  leaveRoom: PropTypes.func,
};

export default SpectatorArena;
