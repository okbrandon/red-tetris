import { renderHook, act } from '@testing-library/react';
import useResponsiveValue from '../useResponsiveValue.js';

describe('useResponsiveValue', () => {
  it('returns the provided value when calculate is not a function', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const { result } = renderHook(() => useResponsiveValue(42));

    expect(result.current).toBe(42);
    expect(addSpy).not.toHaveBeenCalledWith('resize', expect.any(Function));
    addSpy.mockRestore();
  });

  it('recomputes the value when the window is resized', () => {
    let current = 10;
    const calculate = vi.fn(() => current);

    const { result } = renderHook(() => useResponsiveValue(calculate));

    expect(result.current).toBe(10);
    current = 20;

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(20);
    expect(calculate).toHaveBeenCalledTimes(3);
  });

  it('cleans up the resize listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const calculate = vi.fn(() => 1);
    const { unmount } = renderHook(() => useResponsiveValue(calculate));

    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    const handler = addSpy.mock.calls.find(([event]) => event === 'resize')[1];

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('resize', handler);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
