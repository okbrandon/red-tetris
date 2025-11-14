import { useSelector } from 'react-redux';
import { ArenaContainer } from './SoloArenaPage.styles';
import { resultModalShape } from '@/components/GameResultModal/GameResultModal.propTypes';
import GamePlayingView from '@/components/GameViews/GamePlayingView';

const SoloArena = ({ resultModal }) => {
  const { grid, score, nextPieces, lineClearLog, currentPiece } = useSelector(
    (state) => state.game
  );

  return (
    <ArenaContainer>
      <GamePlayingView
        grid={grid}
        currentPiece={currentPiece}
        resultModal={resultModal}
        score={score}
        nextPieces={nextPieces}
        lineClearLog={lineClearLog}
      />
    </ArenaContainer>
  );
};

SoloArena.propTypes = {
  resultModal: resultModalShape.isRequired,
};

export default SoloArena;
