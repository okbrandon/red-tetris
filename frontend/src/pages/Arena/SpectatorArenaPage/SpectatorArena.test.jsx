import { act, render } from '@testing-library/react';
import { vi } from 'vitest';
import SpectatorArena from './SpectatorArena.jsx';

const specterColumnCalls = [];
const focusedViewMock = vi.fn(() => <div data-testid="focused-spectator" />);

vi.mock('@/components/SpecterColumn/SpecterColumn.jsx', () => ({
  __esModule: true,
  default: (props) => {
    specterColumnCalls.push(props);
    return <div data-testid="specter-column" />;
  },
}));

vi.mock('@/components/GameViews/FocusedSpectatorView.jsx', () => ({
  __esModule: true,
  default: (props) => focusedViewMock(props),
}));

const leaveRoomMock = vi.fn();

const makeOpponent = (id, overrides = {}) => ({
  id,
  username: `${id}-user`,
  name: `${id}-name`,
  specter: [[id.toUpperCase()]],
  ...overrides,
});

describe('SpectatorArenaPage', () => {
  beforeEach(() => {
    specterColumnCalls.length = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the focused player in sync with selection changes and opponent updates', () => {
    const opponents = [makeOpponent('alpha'), makeOpponent('beta')];

    const { rerender } = render(
      <SpectatorArena
        opponents={opponents}
        leaveRoom={leaveRoomMock}
        lineClearLog={[{ id: 1, message: 'combo' }]}
      />
    );

    const initialFocusedCall = focusedViewMock.mock.calls.at(-1)[0];
    expect(initialFocusedCall.focusedPlayer).toEqual(opponents[0]);
    expect(initialFocusedCall.grid).toEqual(opponents[0].specter);
    expect(initialFocusedCall.leaveRoom).toBe(leaveRoomMock);

    const lastSpecterProps = specterColumnCalls.at(-1);
    expect(lastSpecterProps.isInteractive).toBe(true);
    expect(lastSpecterProps.selectedId).toBe(opponents[0].id);

    act(() => {
      lastSpecterProps.setSelectedId(opponents[1].id);
    });

    const afterSelectCall = focusedViewMock.mock.calls.at(-1)[0];
    expect(afterSelectCall.focusedPlayer).toEqual(opponents[1]);
    expect(afterSelectCall.grid).toEqual(opponents[1].specter);

    rerender(
      <SpectatorArena
        opponents={[opponents[0]]}
        leaveRoom={leaveRoomMock}
        lineClearLog={[{ id: 2, message: 'back-to-back' }]}
      />
    );

    const postUpdateCall = focusedViewMock.mock.calls.at(-1)[0];
    expect(postUpdateCall.focusedPlayer).toEqual(opponents[0]);
    expect(postUpdateCall.grid).toEqual(opponents[0].specter);
    expect(postUpdateCall.lineClearLog).toEqual([
      { id: 2, message: 'back-to-back' },
    ]);
  });

  it('handles an empty opponent list by clearing the focused player', () => {
    render(
      <SpectatorArena
        opponents={[]}
        leaveRoom={leaveRoomMock}
        lineClearLog={[]}
      />
    );

    const lastSpecterProps = specterColumnCalls.at(-1);
    expect(lastSpecterProps.selectedId).toBeNull();

    const focusedCall = focusedViewMock.mock.calls.at(-1)[0];
    expect(focusedCall.focusedPlayer).toBeNull();
    expect(focusedCall.grid).toBeNull();
  });

  it('defaults to a null selection when the first opponent is missing an id', () => {
    const opponents = [makeOpponent('alpha', { id: undefined })];

    render(
      <SpectatorArena
        opponents={opponents}
        leaveRoom={leaveRoomMock}
        lineClearLog={[]}
      />
    );

    const lastSpecterProps = specterColumnCalls.at(-1);
    expect(lastSpecterProps.selectedId).toBeNull();

    const focusedCall = focusedViewMock.mock.calls.at(-1)[0];
    expect(focusedCall.focusedPlayer).toEqual(opponents[0]);
    expect(focusedCall.grid).toEqual(opponents[0].specter);
  });
});
