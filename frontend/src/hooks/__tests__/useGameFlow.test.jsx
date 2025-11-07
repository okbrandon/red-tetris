import { renderHook, waitFor } from '@testing-library/react';
import useGameFlow from '../useGameFlow.js';
import { SOLO_ROOM_NAME } from '@/store/slices/gameSlice.js';
import { showNotification } from '@/store/slices/notificationSlice.js';
import {
  requestRoomJoin,
  requestRoomLeave,
  requestStartGame,
  requestRoomModeChange,
} from '@/store/slices/socketThunks';
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
  requestRoomJoin: vi.fn(),
  requestRoomLeave: vi.fn(),
  requestStartGame: vi.fn(),
  requestRoomModeChange: vi.fn(),
}));

describe('useGameFlow', () => {
  let mockDispatch;
  let mockNavigate;
  let mockState;

  beforeEach(() => {
    mockDispatch = vi.fn();
    mockNavigate = vi.fn();
    mockState = {
      game: {
        isOwner: false,
        mode: '',
        gameStatus: '',
        roomMode: 'classic',
      },
      user: { username: 'player-one' },
    };

    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation((selector) => selector(mockState));
    useNavigate.mockReturnValue(mockNavigate);

    requestRoomJoin.mockClear();
    requestRoomLeave.mockClear();
    requestStartGame.mockClear();
    requestRoomModeChange.mockClear();
  });

  afterEach(() => {
    mockDispatch.mockClear();
    mockNavigate.mockClear();
  });

  it('requests a solo game start when entering a solo room that is not in progress', async () => {
    mockState.game.mode = 'solo';
    mockState.game.gameStatus = 'waiting';

    renderHook(() => useGameFlow({ roomName: 'solo-room' }));

    await waitFor(() => {
      expect(requestStartGame).toHaveBeenCalledTimes(1);
    });
  });

  it('navigates to the solo arena when the game becomes active', async () => {
    mockState.game.mode = 'solo';
    mockState.game.gameStatus = 'in-game';
    mockState.user.username = 'ace';

    renderHook(() => useGameFlow({ roomName: 'solo-room' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/solo-room/ace');
    });
  });

  it('navigates to the multiplayer lobby when waiting for players', async () => {
    mockState.game.mode = 'multiplayer';
    mockState.game.gameStatus = 'waiting';
    mockState.user.username = 'taylor';

    renderHook(() => useGameFlow({ roomName: 'arena' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/arena/taylor');
    });
  });

  it('joins a solo room and notifies the player', () => {
    const { result } = renderHook(() => useGameFlow({ roomName: 'ignored' }));

    mockDispatch.mockClear();
    requestRoomJoin.mockClear();

    result.current.joinSoloRoom('arcade');

    expect(requestRoomJoin).toHaveBeenCalledWith({
      roomName: SOLO_ROOM_NAME,
      soloJourney: true,
      mode: 'arcade',
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      showNotification({ type: 'info', message: 'Starting solo journey...' })
    );
  });

  it('validates multiplayer room names before joining', () => {
    const { result } = renderHook(() => useGameFlow({ roomName: '   ' }));

    mockDispatch.mockClear();
    requestRoomJoin.mockClear();

    result.current.joinMultiplayerRoom();

    expect(requestRoomJoin).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      showNotification({
        type: 'error',
        message: 'Enter a room name to join a lobby.',
      })
    );
  });

  it('joins a multiplayer room and shows a success message', () => {
    const { result } = renderHook(() => useGameFlow({ roomName: ' Lobby ' }));

    mockDispatch.mockClear();
    requestRoomJoin.mockClear();

    result.current.joinMultiplayerRoom();

    expect(requestRoomJoin).toHaveBeenCalledWith({
      roomName: 'Lobby',
      soloJourney: false,
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      showNotification({
        type: 'success',
        message: 'Joining lobby Lobby…',
      })
    );
  });

  it('prevents non-owners from starting multiplayer games', () => {
    mockState.game.isOwner = false;

    const { result } = renderHook(() => useGameFlow({ roomName: 'arena' }));

    mockDispatch.mockClear();
    requestStartGame.mockClear();

    result.current.startMultiplayerGame();

    expect(requestStartGame).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      showNotification({
        type: 'error',
        message: 'Only the lobby owner can start the game.',
      })
    );
  });

  it('allows owners to start multiplayer games', () => {
    mockState.game.isOwner = true;

    const { result } = renderHook(() => useGameFlow({ roomName: 'arena' }));

    mockDispatch.mockClear();
    requestStartGame.mockClear();

    result.current.startMultiplayerGame();

    expect(requestStartGame).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('leaves the lobby and informs the player', () => {
    const { result } = renderHook(() => useGameFlow({ roomName: 'arena' }));

    mockDispatch.mockClear();
    requestRoomLeave.mockClear();

    result.current.leaveLobby();

    expect(requestRoomLeave).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      showNotification({ type: 'info', message: 'Leaving lobby…' })
    );
  });

  it('blocks room mode changes from non-owners', () => {
    mockState.game.isOwner = false;

    const { result } = renderHook(() => useGameFlow({ roomName: 'arena' }));

    mockDispatch.mockClear();
    requestRoomModeChange.mockClear();

    result.current.changeRoomMode('sprint');

    expect(requestRoomModeChange).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      showNotification({
        type: 'error',
        message: 'Only the lobby owner can change the game mode.',
      })
    );
  });

  it('ignores mode changes that are missing or unchanged', () => {
    mockState.game.isOwner = true;
    mockState.game.roomMode = 'classic';

    const { result } = renderHook(() => useGameFlow({ roomName: 'arena' }));

    mockDispatch.mockClear();
    requestRoomModeChange.mockClear();

    result.current.changeRoomMode('classic');
    result.current.changeRoomMode('');

    expect(requestRoomModeChange).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('requests a room mode change when permitted', () => {
    mockState.game.isOwner = true;
    mockState.game.roomMode = 'classic';

    const { result } = renderHook(() => useGameFlow({ roomName: 'arena' }));

    mockDispatch.mockClear();
    requestRoomModeChange.mockClear();

    result.current.changeRoomMode('sprint');

    expect(requestRoomModeChange).toHaveBeenCalledWith({ mode: 'sprint' });
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
