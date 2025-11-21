import { render } from '@testing-library/react';
import { vi } from 'vitest';
import SoloArena from './SoloArenaPage.jsx';

const useSelectorMock = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: (selector) => useSelectorMock(selector),
}));

const gamePlayingViewMock = vi.fn(() => <div data-testid="game-view" />);

vi.mock('@/components/GameViews/GamePlayingView.jsx', () => ({
  __esModule: true,
  default: (props) => gamePlayingViewMock(props),
}));

const baseResultModal = {
  isOpen: false,
  outcome: {},
  onConfirm: vi.fn(),
  isOwner: false,
  canSpectate: false,
  onSpectate: vi.fn(),
  isGameOver: false,
};

describe('SoloArenaPage', () => {
  beforeEach(() => {
    useSelectorMock.mockImplementation((selector) =>
      selector({
        game: {
          grid: [[0, 1]],
          score: 42,
          nextPieces: ['I'],
          lineClearLog: [{ id: 1, message: 'Tetris!' }],
          currentPiece: { id: 'piece' },
          roomMode: 'classic',
          hideCurrentPiece: false,
        },
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the player view using state from the store', () => {
    render(<SoloArena resultModal={baseResultModal} />);

    expect(useSelectorMock).toHaveBeenCalledTimes(1);
    expect(gamePlayingViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        grid: [[0, 1]],
        score: 42,
        resultModal: baseResultModal,
        nextPieces: ['I'],
        lineClearLog: [{ id: 1, message: 'Tetris!' }],
        currentPiece: { id: 'piece' },
        hideActivePiece: false,
      })
    );
  });
});
