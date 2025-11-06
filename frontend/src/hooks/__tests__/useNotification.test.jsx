import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react';
import useNotification from '../useNotification.js';
import notificationReducer, {
  showNotification,
} from '@/store/slices/notificationSlice.js';
import { ANIMATION_MS } from '@/components/Notification/Notification.styles.js';

const baseNotificationState = notificationReducer(undefined, { type: 'init' });

const createStore = (notificationState = {}) =>
  configureStore({
    reducer: { notification: notificationReducer },
    preloadedState: {
      notification: {
        ...baseNotificationState,
        ...notificationState,
      },
    },
  });

describe('useNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      cb();
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('remains closed when there is no active notification', () => {
    const store = createStore();
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useNotification(), { wrapper });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.shouldRender).toBe(false);
  });

  it('opens, auto hides, and finishes the close animation cycle', () => {
    const store = createStore();
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      store.dispatch(
        showNotification({
          type: 'info',
          message: 'Testing auto hide',
          duration: 60,
        })
      );
    });

    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(store.getState().notification.isVisible).toBe(false);
    expect(result.current.isOpen).toBe(false);

    act(() => {
      vi.advanceTimersByTime(ANIMATION_MS);
    });

    expect(result.current.shouldRender).toBe(false);
  });
});
