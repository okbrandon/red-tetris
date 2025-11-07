import { renderHook } from '@testing-library/react';
import usePieceControls from '../usePieceControls.js';
import { requestPieceMove } from '@/store/slices/socketThunks.js';
import {
  extractMoveDirection,
  shouldIgnoreForGameControls,
} from '@/utils/keyboard.js';

vi.mock('@/store/slices/socketThunks.js', () => ({
  requestPieceMove: vi.fn(),
}));

vi.mock('@/utils/keyboard.js', () => ({
  extractMoveDirection: vi.fn(),
  shouldIgnoreForGameControls: vi.fn(),
}));

describe('usePieceControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('binds keydown events and requests piece moves', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    shouldIgnoreForGameControls.mockReturnValue(false);
    extractMoveDirection.mockReturnValue('left');

    const { unmount } = renderHook(() => usePieceControls());

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    const handler = addSpy.mock.calls.find(([event]) => event === 'keydown')[1];

    const preventDefault = vi.fn();
    const mockTarget = document.createElement('div');

    handler({ preventDefault, target: mockTarget });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(requestPieceMove).toHaveBeenCalledWith({ direction: 'left' });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', handler);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('skips binding when the result modal is open', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => usePieceControls({ isResultModalOpen: true }));

    expect(addSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));

    addSpy.mockRestore();
  });

  it('ignores events when they should not trigger controls', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');

    shouldIgnoreForGameControls.mockReturnValue(true);
    extractMoveDirection.mockReturnValue('right');

    renderHook(() => usePieceControls());
    const handler = addSpy.mock.calls.find(([event]) => event === 'keydown')[1];

    handler({
      preventDefault: vi.fn(),
      target: document.createElement('input'),
    });

    expect(requestPieceMove).not.toHaveBeenCalled();

    shouldIgnoreForGameControls.mockReturnValue(false);
    extractMoveDirection.mockReturnValue(undefined);
    handler({ preventDefault: vi.fn(), target: document.body });

    expect(requestPieceMove).not.toHaveBeenCalled();

    addSpy.mockRestore();
  });
});
