import { useSelector } from 'react-redux';
import { ArenaContainer } from './SoloArenaPage.styles';
import { resultModalShape } from '@/components/GameResultModal/GameResultModal.propTypes';
import GamePlayingView from '@/components/GameViews/GamePlayingView';
import { INVISIBLE_FALLING_PIECES_MODE } from '@/utils/gameModes';

const SoloArena = ({ resultModal }) => {
  const {
    you,
    grid,
    score,
    nextPieces,
    lineClearLog,
    currentPiece,
    roomMode,
    hideCurrentPiece,
  } = useSelector((state) => state.game);

  const hideActivePiece = Boolean(
    hideCurrentPiece ?? roomMode === INVISIBLE_FALLING_PIECES_MODE
  );

  return (
    <ArenaContainer>
      <GamePlayingView
        grid={grid}
        currentPiece={currentPiece}
        resultModal={resultModal}
        score={score}
        you={you}
        nextPieces={nextPieces}
        lineClearLog={lineClearLog}
        hideActivePiece={hideActivePiece}
      />
    </ArenaContainer>
  );
};

SoloArena.propTypes = {
  resultModal: resultModalShape.isRequired,
};

export default SoloArena;
