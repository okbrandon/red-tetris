import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MultiArena from './MultiArenaPage.jsx';

const useSelectorMock = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: (selector) => useSelectorMock(selector),
}));

const spectatorArenaMock = vi.fn(() => <div data-testid="spectator-view" />);

vi.mock('../SpectatorArenaPage/SpectatorArena.jsx', () => ({
  __esModule: true,
  default: (props) => spectatorArenaMock(props),
}));

const specterColumnMock = vi.fn(() => <div data-testid="specter-column" />);

vi.mock('@/components/SpecterColumn/SpecterColumn.jsx', () => ({
  __esModule: true,
  default: (props) => specterColumnMock(props),
}));

const gamePlayingViewMock = vi.fn(() => <div data-testid="playing-view" />);

vi.mock('@/components/GameViews/GamePlayingView.jsx', () => ({
  __esModule: true,
  default: (props) => gamePlayingViewMock(props),
}));

const baseResultModal = {
  isOpen: true,
  outcome: { status: 'win' },
  onConfirm: vi.fn(),
  isOwner: true,
  canSpectate: true,
  onSpectate: vi.fn(),
  isGameOver: false,
};

const leaveRoomMock = vi.fn();

const setState = (gameState) => {
  useSelectorMock.mockImplementation((selector) =>
    selector({
      game: {
        roomMode: 'classic',
        hideCurrentPiece: false,
        ...gameState,
      },
    })
  );
};

describe('MultiArenaPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the spectator arena when the user is spectating and filters opponents', () => {
    const players = [
      { id: 'you', specter: [['Y']] },
      { id: 'opponent-a', specter: [['A']] },
    ];

    setState({
      you: { id: 'you' },
      players,
      grid: [[0]],
      spectator: { active: true },
      score: 10,
      nextPieces: ['I'],
      lineClearLog: [{ id: 1, message: 'line' }],
      currentPiece: { type: 'I', position: { x: 0, y: 0 } },
    });

    render(
      <MultiArena resultModal={baseResultModal} leaveRoom={leaveRoomMock} />
    );

    expect(spectatorArenaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        leaveRoom: leaveRoomMock,
        opponents: [players[1]],
        lineClearLog: [{ id: 1, message: 'line' }],
      })
    );
    expect(screen.getByTestId('spectator-view')).toBeInTheDocument();
    expect(gamePlayingViewMock).not.toHaveBeenCalled();
    expect(specterColumnMock).not.toHaveBeenCalled();
  });

  it('renders the main arena with an empty opponent list when players are not an array', () => {
    setState({
      you: { id: 'you' },
      players: null,
      grid: [[1]],
      spectator: { active: false },
      score: 3,
      nextPieces: ['O'],
      lineClearLog: [],
      currentPiece: { type: 'O', position: { x: 5, y: 0 } },
    });

    render(
      <MultiArena resultModal={baseResultModal} leaveRoom={leaveRoomMock} />
    );

    expect(screen.getByTestId('playing-view')).toBeInTheDocument();
    expect(specterColumnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ opponents: [] })
    );
    expect(gamePlayingViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        grid: [[1]],
        resultModal: baseResultModal,
        score: 3,
        nextPieces: ['O'],
        lineClearLog: [],
        currentPiece: { type: 'O', position: { x: 5, y: 0 } },
        hideActivePiece: false,
      })
    );
  });

  it('passes through opponents unchanged when the player id is missing', () => {
    const opponents = [
      { id: 'opponent-a', specter: [['A']] },
      { id: 'opponent-b', specter: [['B']] },
    ];

    setState({
      you: {},
      players: opponents,
      grid: [[2]],
      spectator: { active: false },
      score: 7,
      nextPieces: ['T'],
      lineClearLog: [{ id: 2, message: 'double' }],
      currentPiece: { type: 'T', position: { x: 3, y: 4 } },
    });

    render(
      <MultiArena resultModal={baseResultModal} leaveRoom={leaveRoomMock} />
    );

    expect(specterColumnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ opponents })
    );
    expect(gamePlayingViewMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        lineClearLog: [{ id: 2, message: 'double' }],
        currentPiece: { type: 'T', position: { x: 3, y: 4 } },
        hideActivePiece: false,
      })
    );
  });
});
