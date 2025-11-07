import { describe, it, expect, vi } from 'vitest';
import reducer, {
  showNotification,
  hideNotification,
} from '../slices/notificationSlice.js';

const init = () => reducer(undefined, { type: '@@INIT' });

describe('notificationSlice', () => {
  it('shows notifications with defaults and generated ids', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValueOnce(1234);

    const state = reducer(
      init(),
      showNotification({ message: 'Hi', type: 'success', duration: 1000 })
    );

    expect(state).toMatchObject({
      isVisible: true,
      message: 'Hi',
      type: 'success',
      duration: 1000,
      id: 1234,
    });
    nowSpy.mockRestore();
  });

  it('applies default duration when value is invalid', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValueOnce(9999);

    const state = reducer(
      init(),
      showNotification({ message: 'Oops', duration: -1 })
    );

    expect(state.duration).toBe(4000);
    expect(state.id).toBe(9999);
    nowSpy.mockRestore();
  });

  it('hides notifications', () => {
    const shown = reducer(init(), showNotification({ message: 'Hello there' }));

    const hidden = reducer(shown, hideNotification());
    expect(hidden.isVisible).toBe(false);
  });
});
