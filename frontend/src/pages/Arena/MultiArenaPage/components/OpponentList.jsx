import OpponentBoard from './OpponentBoard.jsx';
import {
  EmptyNotice,
  OpponentColumn,
  OpponentGrid,
  SectionLabel,
} from '../MultiArenaPage.styles.js';
import { useMemo } from 'react';
import {
  deriveCardScale,
  estimateOpponentCellSize,
} from '@/utils/arenaSizing.js';

const OpponentList = ({ opponents }) => {
  const opponentCount = opponents.length;

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
          {opponents.map((opponent, index) => (
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
