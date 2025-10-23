import { useSelector } from 'react-redux';
import { ArenaContainer } from './SoloArenaPage.styles';
import GameView from '@/components/GameView/GameView';
import propTypes from 'prop-types';

const SoloArena = ({ resultModal }) => {
  const grid = useSelector((state) => state.game.grid);

  return (
    <ArenaContainer>
      <GameView grid={grid} resultModal={resultModal} isPlaying={true} />
    </ArenaContainer>
  );
};

SoloArena.propTypes = {
  resultModal: propTypes.node.isRequired,
}

export default SoloArena;
