import SpectatorArena from '@/components/SpectatorArena/SpectatorArena';
import { deriveCardScale, estimateOpponentCellSize } from '@/utils/arenaSizing';
import { useSelector } from 'react-redux';
import {
  ArenaContainer,
  ArenaLayout,
  EmptyNotice,
  MainColumn,
  MiniBoard,
  OpponentBadge,
  OpponentCard,
  OpponentColumn,
  OpponentGrid,
  OpponentHeader,
  OpponentName,
  SectionLabel,
} from './MultiArena.styles';
import TetrisGrid from '@/components/TetrisGrid/TetrisGrid';
import GameView from '@/components/GameView/GameView';

const OpponentBoard = ({ opponent, index, cellSize }) => {
  const board = opponent?.specter ?? [];
  const name = opponent?.username ?? `Opponent ${index + 1}`;

  return (
    <OpponentCard>
      <OpponentHeader>
        <OpponentBadge>{`Player ${index + 1}`}</OpponentBadge>
        <OpponentName>{name}</OpponentName>
      </OpponentHeader>
      <MiniBoard>
        <TetrisGrid
          rows={20}
          cols={10}
          cellSize={cellSize}
          showGrid={false}
          grid={board}
        />
      </MiniBoard>
    </OpponentCard>
  );
};

const MultiArena = ({ leaveRoom }) => {
  const { you, players, grid } = useSelector((state) => state.game);
  const opponents = players.filter((player) => you?.id !== player?.id);

  const opponentCellSize = estimateOpponentCellSize(opponents.length);
  const cardScale = deriveCardScale(opponents.length);
  const cardScaleStyle = { '--card-scale': cardScale };

  const { spectator } = useSelector((state) => state.game);

  if (spectator?.active) {
    return <SpectatorArena leaveRoom={leaveRoom} />;
  }

  return (
    <ArenaContainer>
      <ArenaLayout>
        <OpponentColumn style={cardScaleStyle}>
          <SectionLabel>{`Opponents${
            opponents.length ? ` (${opponents.length})` : ''
          }`}</SectionLabel>
          {opponents.length ? (
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

        <MainColumn>
          <GameView grid={grid} resultModal={resultModal} />
        </MainColumn>
      </ArenaLayout>
    </ArenaContainer>
  );
};

export default MultiArena;
