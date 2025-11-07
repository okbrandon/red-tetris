import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ArenaContainer as SpectatorContainer,
  ArenaLayout as SpectatorLayout,
} from './SpectatorArena.styles.js';
import SpecterColumn from '@/components/SpecterColumn/SpecterColumn.jsx';
import FocusedSpectatorView from '@/components/GameViews/FocusedSpectatorView.jsx';

const SpectatorArena = ({ leaveRoom, opponents, lineClearLog }) => {
  const [selectedId, setSelectedId] = useState(() => opponents[0]?.id ?? null);

  useEffect(() => {
    if (!opponents.length) {
      setSelectedId(null);
      return;
    }
    const firstId = opponents[0]?.id ?? null;
    const hasSelected =
      selectedId && opponents.some((player) => player?.id === selectedId);
    if (!hasSelected && selectedId !== firstId) {
      setSelectedId(firstId);
    }
  }, [opponents, selectedId]);

  const focusedPlayer = useMemo(
    () =>
      opponents.find((player) => player?.id === selectedId) ??
      opponents[0] ??
      null,
    [opponents, selectedId]
  );

  const focusedBoard = focusedPlayer ? focusedPlayer.specter : null;

  return (
    <SpectatorContainer>
      <SpectatorLayout>
        <SpecterColumn
          isInteractive
          opponents={opponents}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
        <FocusedSpectatorView
          grid={focusedBoard}
          focusedPlayer={focusedPlayer}
          leaveRoom={leaveRoom}
          lineClearLog={lineClearLog}
        />
      </SpectatorLayout>
    </SpectatorContainer>
  );
};

SpectatorArena.propTypes = {
  leaveRoom: PropTypes.func,
  opponents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      username: PropTypes.string,
      name: PropTypes.string,
      specter: PropTypes.arrayOf(PropTypes.array),
    })
  ),
  lineClearLog: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      message: PropTypes.string,
    })
  ),
};

export default SpectatorArena;
