import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ArenaRouter from './ArenaRouter.jsx';

const useSelectorMock = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: (selector) => useSelectorMock(selector),
}));

const gameResultsFactoryMock = vi.fn();

vi.mock('@/hooks/useGameResults.js', () => ({
  __esModule: true,
  default: () => gameResultsFactoryMock(),
}));

const roomLobbyMock = vi.fn(() => <div data-testid="room-lobby" />);

vi.mock('../../RoomLobbyPage/RoomLobbyPage', () => ({
  __esModule: true,
  default: (props) => roomLobbyMock(props),
}));

const backButtonMock = vi.fn(() => <button type="button">Back</button>);

vi.mock('@/components/Backbutton/BackButton.jsx', () => ({
  __esModule: true,
  default: (props) => backButtonMock(props),
}));

const multiArenaMock = vi.fn(() => <div data-testid="multi-arena" />);

vi.mock('@/pages/Arena/MultiArenaPage/MultiArenaPage.jsx', () => ({
  __esModule: true,
  default: (props) => multiArenaMock(props),
}));

const soloArenaMock = vi.fn(() => <div data-testid="solo-arena" />);

vi.mock('../SoloArenaPage/SoloArenaPage', () => ({
  __esModule: true,
  default: (props) => soloArenaMock(props),
}));

const setState = (gameState) => {
  useSelectorMock.mockImplementation((selector) => selector({ game: gameState }));
};

describe('ArenaRouter', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the room lobby while waiting for players', () => {
    setState({ gameStatus: 'waiting' });
  gameResultsFactoryMock.mockReturnValue({});

    render(<ArenaRouter />);

    expect(roomLobbyMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('room-lobby')).toBeInTheDocument();
    expect(backButtonMock).not.toHaveBeenCalled();
    expect(multiArenaMock).not.toHaveBeenCalled();
    expect(soloArenaMock).not.toHaveBeenCalled();
  });

  it('routes to the multiplayer arena and builds the result modal props', () => {
    const leaveRoom = vi.fn();
    const returnToMenu = vi.fn();
    const spectateGame = vi.fn();

    setState({
      gameStatus: 'active',
      mode: 'multiplayer',
      spectator: { eligible: true },
      playerOutcome: { result: 'lose' },
      isOwner: true,
      isResultModalOpen: true,
    });

    gameResultsFactoryMock.mockReturnValue({
      leaveRoom,
      returnToMenu,
      spectateGame,
    });

    render(<ArenaRouter />);

    expect(backButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({ onClick: leaveRoom })
    );
    expect(screen.getByText('Multiplayer')).toBeInTheDocument();

    expect(multiArenaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        leaveRoom,
        resultModal: {
          isOpen: true,
          outcome: { result: 'lose' },
          onConfirm: returnToMenu,
          isOwner: true,
          canSpectate: true,
          onSpectate: spectateGame,
          isGameOver: false,
        },
      })
    );
    expect(soloArenaMock).not.toHaveBeenCalled();
  });

  it('routes to the solo arena and marks game over state', () => {
    const leaveRoom = vi.fn();
    const returnToMenu = vi.fn();
    const spectateGame = vi.fn();

    setState({
      gameStatus: 'game-over',
      mode: 'solo',
      spectator: { eligible: false },
      playerOutcome: { result: 'win' },
      isOwner: false,
      isResultModalOpen: false,
    });

    gameResultsFactoryMock.mockReturnValue({
      leaveRoom,
      returnToMenu,
      spectateGame,
    });

    render(<ArenaRouter />);

    expect(screen.getByText('Game')).toBeInTheDocument();
    expect(soloArenaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resultModal: {
          isOpen: false,
          outcome: { result: 'win' },
          onConfirm: returnToMenu,
          isOwner: false,
          canSpectate: false,
          onSpectate: spectateGame,
          isGameOver: true,
        },
      })
    );
    expect(multiArenaMock).not.toHaveBeenCalled();
  });
});
