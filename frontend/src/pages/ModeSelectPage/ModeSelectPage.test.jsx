import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ModeSelectPage from './ModeSelectPage.jsx';
import { SOLO_MODE_OPTIONS } from '@/utils/gameModes.js';

const navigateMock = vi.fn();
const gameFlowFactoryMock = vi.fn();
const joinSoloRoomMock = vi.fn();
let selectorState;
const useSelectorMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('react-redux', () => ({
  useSelector: (selector) => useSelectorMock(selector),
}));

vi.mock('@/hooks/useGameFlow.js', () => ({
  __esModule: true,
  default: (options) => gameFlowFactoryMock(options),
}));

describe('ModeSelectPage', () => {
  beforeEach(() => {
    selectorState = { game: { roomName: 'Room-42' } };
    useSelectorMock.mockImplementation((selector) => selector(selectorState));
    navigateMock.mockReset();
    joinSoloRoomMock.mockReset();
    gameFlowFactoryMock.mockReturnValue({ joinSoloRoom: joinSoloRoomMock });
  });

  it('shows the main menu and toggles to solo selection', () => {
    render(<ModeSelectPage />);

    expect(screen.getByText('Choose how you want to play')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /choose a solo game mode/i })
    );

    expect(screen.getByText('Pick your solo challenge')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /start/i })).toHaveLength(
      SOLO_MODE_OPTIONS.length
    );

    fireEvent.click(
      screen.getByRole('button', { name: /go back to the previous page/i })
    );
    expect(screen.getByText('Choose how you want to play')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('navigates to the appropriate routes from the main menu', () => {
    render(<ModeSelectPage />);

    fireEvent.click(
      screen.getByRole('button', { name: /go back to the previous page/i })
    );
    expect(navigateMock).toHaveBeenCalledWith('/');

    navigateMock.mockReset();
    fireEvent.click(
      screen.getByRole('button', { name: /view your recent games/i })
    );
    expect(navigateMock).toHaveBeenCalledWith('/history');
  });

  it('starts the selected solo mode', () => {
    render(<ModeSelectPage />);

    fireEvent.click(
      screen.getByRole('button', { name: /choose a solo game mode/i })
    );

    const firstMode = SOLO_MODE_OPTIONS[0];
    fireEvent.click(
      screen.getByRole('button', { name: `Start ${firstMode.title} solo mode` })
    );

    expect(joinSoloRoomMock).toHaveBeenCalledWith(firstMode.id);
    expect(gameFlowFactoryMock).toHaveBeenCalledWith({ roomName: 'Room-42' });
  });
});
