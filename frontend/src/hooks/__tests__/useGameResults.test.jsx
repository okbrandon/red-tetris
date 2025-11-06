import { renderHook, waitFor } from '@testing-library/react';
import useGameResults from '../useGameResults.js';
import {
  setIsResultModalOpen,
  setSpectatorActive,
} from '@/store/slices/gameSlice.js';
import { showNotification } from '@/store/slices/notificationSlice.js';
import { requestRoomLeave } from '@/store/slices/socketThunks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@/store/slices/socketThunks', () => ({
  requestRoomLeave: vi.fn(),
}));

describe('useGameResults', () => {
  let mockDispatch;
  let mockNavigate;
  let mockState;

  beforeEach(() => {
    mockDispatch = vi.fn();
    mockNavigate = vi.fn();
    mockState = {
      game: {
        gameStatus: '',
        playerOutcome: null,
        isResultModalOpen: false,
      },
      user: { username: 'nova' },
    };

    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation((selector) => selector(mockState));
    useNavigate.mockReturnValue(mockNavigate);

    requestRoomLeave.mockClear();
  });

  afterEach(() => {
    mockDispatch.mockClear();
    mockNavigate.mockClear();
  });

  it('opens the result modal when the game ends', async () => {
    mockState.game.gameStatus = 'game-over';

    renderHook(() => useGameResults());

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setIsResultModalOpen(true));
    });
  });

  it('opens the result modal when a player outcome is reported', async () => {
    mockState.game.gameStatus = 'in-game';
    mockState.game.playerOutcome = { outcome: 'win' };

    renderHook(() => useGameResults());

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setIsResultModalOpen(true));
    });
  });

  it('closes the result modal when the outcome disappears mid-game', async () => {
    mockState.game.gameStatus = 'in-game';
    mockState.game.playerOutcome = {};
    mockState.game.isResultModalOpen = true;

    renderHook(() => useGameResults());

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setIsResultModalOpen(false));
    });
  });

  it('navigates back to the menu when there is no active game', async () => {
    mockState.game.gameStatus = '';
    mockState.user.username = 'riley';

    renderHook(() => useGameResults());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/menu');
    });
  });

  it('returns the user to the menu and resets spectator state', () => {
    const { result } = renderHook(() => useGameResults());

    mockDispatch.mockClear();
    requestRoomLeave.mockClear();

    result.current.returnToMenu();

    expect(mockDispatch).toHaveBeenCalledWith(setIsResultModalOpen(false));
    expect(mockDispatch).toHaveBeenCalledWith(setSpectatorActive(false));
    expect(mockDispatch).toHaveBeenCalledWith(
      showNotification({ type: 'info', message: 'Returning to menu…' })
    );
    expect(requestRoomLeave).toHaveBeenCalledTimes(1);
  });

  it('enables spectator mode when requested', () => {
    const { result } = renderHook(() => useGameResults());

    mockDispatch.mockClear();

    result.current.spectateGame();

    expect(mockDispatch).toHaveBeenCalledWith(setSpectatorActive(true));
    expect(mockDispatch).toHaveBeenCalledWith(setIsResultModalOpen(false));
    expect(requestRoomLeave).not.toHaveBeenCalled();
  });

  it('leaves the room and notifies the player', () => {
    const { result } = renderHook(() => useGameResults());

    mockDispatch.mockClear();
    requestRoomLeave.mockClear();

    result.current.leaveRoom();

    expect(mockDispatch).toHaveBeenCalledWith(setSpectatorActive(false));
    expect(mockDispatch).toHaveBeenCalledWith(
      showNotification({ type: 'info', message: 'Leaving room…' })
    );
    expect(requestRoomLeave).toHaveBeenCalledTimes(1);
  });
});
