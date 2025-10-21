import { useSelector } from 'react-redux';
import { ArenaContainer } from './SoloArenaPage.styles';
import GameView from '@/components/GameView/GameView';

const SoloArena = ({ resultModal }) => {
  const grid = useSelector((state) => state.game.grid);

  return (
    <ArenaContainer>
      <GameView grid={grid} resultModal={resultModal} />
    </ArenaContainer>
  );
};

export default SoloArena;
