import { useMemo } from 'react';
import OpponentBoard from './OpponentBoard.jsx';
import {
  EmptyNotice,
  OpponentColumn,
  OpponentGrid,
  SectionLabel,
} from '../MultiArenaPage.styles.js';
import {
  deriveCardScale,
  estimateOpponentCellSize,
} from '@/utils/arenaSizing.js';
import { MAX_VISIBLE_SPECTERS } from '../constants.js';

const OpponentList = ({ opponents }) => {
  const visibleOpponents = useMemo(
    () => opponents.slice(0, MAX_VISIBLE_SPECTERS),
    [opponents]
  );
  const opponentCount = visibleOpponents.length;

  const opponentCellSize = useMemo(
    () => estimateOpponentCellSize(opponentCount),
    [opponentCount]
  );

  const cardScale = useMemo(
    () => deriveCardScale(opponentCount),
    [opponentCount]
  );

  const cardScaleStyle = useMemo(
    () => ({ '--card-scale': cardScale }),
    [cardScale]
  );

  return (
    <OpponentColumn style={cardScaleStyle}>
      <SectionLabel>{`Opponents${
        opponentCount ? ` (${opponentCount})` : ''
      }`}</SectionLabel>
      {opponentCount ? (
        <OpponentGrid aria-label="Opponent boards">
          {visibleOpponents.map((opponent, index) => (
            <OpponentBoard
              key={
                opponent?.id ||
                opponent?.username ||
                opponent?.name ||
                `opponent-${index}`
              }
              opponent={opponent}
              index={index}
              cellSize={opponentCellSize}
            />
          ))}
        </OpponentGrid>
      ) : (
        <EmptyNotice>Waiting for challengers…</EmptyNotice>
      )}
    </OpponentColumn>
  );
};

export default OpponentList;
