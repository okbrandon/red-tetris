import { deriveCardScale, estimateOpponentCellSize } from '@/utils/arenaSizing';
import propTypes from 'prop-types';
import { useMemo } from 'react';
import TetrisGrid from '../TetrisGrid/TetrisGrid';
import {
  EmptyNotice,
  MiniBoard,
  SpecterBadge,
  SpecterCard,
  SpecterColumnContainer,
  SpecterGrid,
  SpecterHeader,
  SpecterName,
} from './SpecterColumn.styles';
import { SectionLabel } from '@/pages/Arena/MultiArenaPage/MultiArenaPage.styles';

const SpecterBoard = ({
  opponent,
  index,
  cellSize,
  isActive,
  isInteractive,
  setSelectedId,
}) => {
  return (
    <SpecterCard
      key={`opponent-${index}`}
      data-active={Boolean(isActive)}
      data-interactive={Boolean(isInteractive)}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? Boolean(isActive) : undefined}
      onClick={
        isInteractive ? () => setSelectedId(opponent?.id || null) : undefined
      }
    >
      <SpecterHeader>
        <SpecterBadge>{`Player ${index + 1}`}</SpecterBadge>
        <SpecterName>{opponent.username}</SpecterName>
      </SpecterHeader>
      <MiniBoard>
        <TetrisGrid cellSize={cellSize} grid={opponent.specter} />
      </MiniBoard>
    </SpecterCard>
  );
};

SpecterBoard.propTypes = {
  opponent: propTypes.shape({
    id: propTypes.string,
    username: propTypes.string,
    name: propTypes.string,
    specter: propTypes.arrayOf(propTypes.array),
  }),
  index: propTypes.number.isRequired,
  cellSize: propTypes.number.isRequired,
  isActive: propTypes.bool,
  isInteractive: propTypes.bool,
  setSelectedId: propTypes.func,
};

const SpecterColumn = ({
  isInteractive = false,
  opponents,
  selectedId,
  setSelectedId,
}) => {
  const opponentCount = opponents.length;

  const cardScale = useMemo(
    () => deriveCardScale(opponentCount),
    [opponentCount]
  );
  const cardScaleStyle = useMemo(
    () => ({ '--card-scale': cardScale }),
    [cardScale]
  );
  const specterCellSize = useMemo(
    () => estimateOpponentCellSize(opponentCount),
    [opponentCount]
  );

  return (
    <SpecterColumnContainer style={cardScaleStyle}>
      <SectionLabel>{`Opponents ${opponentCount ? `(${opponentCount})` : ''}`}</SectionLabel>
      {opponentCount ? (
        <SpecterGrid aria-label="Opponent boards">
          {opponents.map((opponent, index) => (
            <SpecterBoard
              key={
                opponent?.id ||
                opponent?.username ||
                opponent?.name ||
                `opponent-${index}`
              }
              opponent={opponent}
              index={index}
              cellSize={specterCellSize}
              isInteractive={isInteractive}
              isActive={isInteractive ? opponent?.id === selectedId : false}
              setSelectedId={setSelectedId}
            />
          ))}
        </SpecterGrid>
      ) : (
        <SpecterGrid aria-label="Opponent boards">
          <EmptyNotice>Waiting for challengers...</EmptyNotice>
        </SpecterGrid>
      )}
    </SpecterColumnContainer>
  );
};

SpecterColumn.propTypes = {
  isInteractive: propTypes.bool,
  opponents: propTypes.arrayOf(propTypes.object).isRequired,
  selectedId: propTypes.string,
  setSelectedId: propTypes.func,
};

export default SpecterColumn;
