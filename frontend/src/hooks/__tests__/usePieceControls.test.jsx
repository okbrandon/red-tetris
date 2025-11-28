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
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('binds key events and repeats moves while the key is held', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const docAddSpy = vi.spyOn(document, 'addEventListener');
    const docRemoveSpy = vi.spyOn(document, 'removeEventListener');
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    shouldIgnoreForGameControls.mockReturnValue(false);
    extractMoveDirection.mockReturnValue('left');

    const { unmount } = renderHook(() => usePieceControls());

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(docAddSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );

    const keydownHandler = addSpy.mock.calls.find(
      ([event]) => event === 'keydown'
    )[1];
    const keyupHandler = addSpy.mock.calls.find(
      ([event]) => event === 'keyup'
    )[1];
    const blurHandler = addSpy.mock.calls.find(
      ([event]) => event === 'blur'
    )[1];
    const visibilityHandler = docAddSpy.mock.calls.find(
      ([event]) => event === 'visibilitychange'
    )[1];

    const preventDefault = vi.fn();
    const mockTarget = document.createElement('div');

    keydownHandler({
      preventDefault,
      target: mockTarget,
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      repeat: false,
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(requestPieceMove).toHaveBeenCalledTimes(1);
    expect(requestPieceMove).toHaveBeenCalledWith({ direction: 'left' });
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(requestPieceMove).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(40);
    expect(requestPieceMove).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10);
    expect(requestPieceMove).toHaveBeenCalledTimes(2);
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    const intervalId = setIntervalSpy.mock.results[0]?.value;

    vi.advanceTimersByTime(50);
    expect(requestPieceMove).toHaveBeenCalledTimes(3);

    vi.advanceTimersByTime(100);
    expect(requestPieceMove).toHaveBeenCalledTimes(5);

    keyupHandler({ key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
    expect(clearTimeoutSpy).not.toHaveBeenCalled();

    expect(typeof blurHandler).toBe('function');
    blurHandler();

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', keydownHandler);
    expect(removeSpy).toHaveBeenCalledWith('keyup', keyupHandler);
    expect(removeSpy).toHaveBeenCalledWith('blur', blurHandler);
    expect(docRemoveSpy).toHaveBeenCalledWith(
      'visibilitychange',
      visibilityHandler
    );
  });

  it('skips binding when the result modal is open', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const docAddSpy = vi.spyOn(document, 'addEventListener');

    renderHook(() => usePieceControls({ isResultModalOpen: true }));

    expect(addSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(docAddSpy).not.toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );
  });

  it('ignores events when they should not trigger controls', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    shouldIgnoreForGameControls.mockReturnValue(true);
    extractMoveDirection.mockReturnValue('right');

    renderHook(() => usePieceControls());
    const handler = addSpy.mock.calls.find(([event]) => event === 'keydown')[1];

    handler({
      preventDefault: vi.fn(),
      target: document.createElement('input'),
      key: 'ArrowRight',
      code: 'ArrowRight',
      repeat: false,
    });

    expect(requestPieceMove).not.toHaveBeenCalled();

    shouldIgnoreForGameControls.mockReturnValue(false);
    extractMoveDirection.mockReturnValue(undefined);

    handler({
      preventDefault: vi.fn(),
      target: document.body,
      key: 'ArrowRight',
      code: 'ArrowRight',
      repeat: false,
    });

    expect(requestPieceMove).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('prevents duplicate intervals when native key repeat fires', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    shouldIgnoreForGameControls.mockReturnValue(false);
    extractMoveDirection.mockReturnValue('left');

    const { unmount } = renderHook(() => usePieceControls());

    const handler = addSpy.mock.calls.find(([event]) => event === 'keydown')[1];

    handler({
      preventDefault: vi.fn(),
      target: document.createElement('div'),
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      repeat: false,
    });

    expect(requestPieceMove).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).not.toHaveBeenCalled();

    requestPieceMove.mockClear();
    setTimeoutSpy.mockClear();
    setIntervalSpy.mockClear();

    const preventDefault = vi.fn();
    handler({
      preventDefault,
      target: document.createElement('div'),
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      repeat: true,
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(requestPieceMove).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(260);
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    requestPieceMove.mockClear();
    setTimeoutSpy.mockClear();
    setIntervalSpy.mockClear();

    handler({
      preventDefault: vi.fn(),
      target: document.createElement('div'),
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      repeat: true,
    });

    expect(requestPieceMove).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();

    unmount();
  });

  it('does not auto-repeat for non-movement directions', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    shouldIgnoreForGameControls.mockReturnValue(false);
    extractMoveDirection.mockReturnValue('space');

    const { unmount } = renderHook(() => usePieceControls());

    const handler = addSpy.mock.calls.find(([event]) => event === 'keydown')[1];

    handler({
      preventDefault: vi.fn(),
      target: document.createElement('div'),
      key: ' ',
      code: 'Space',
      repeat: false,
    });

    expect(requestPieceMove).toHaveBeenCalledWith({ direction: 'space' });
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();

    unmount();
  });
});
