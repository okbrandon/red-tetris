import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const initializeSocket = vi.fn();

vi.mock('@/store/slices/socketThunks.js', () => ({
  initializeSocket,
}));

const loadProvider = async () => {
  const module = await import('../SocketProvider.jsx');
  return module.default;
};

describe('SocketProvider', () => {
  beforeEach(() => {
    initializeSocket.mockReset();
  });

  it('initialises the socket layer on mount and renders children', async () => {
    const SocketProvider = await loadProvider();

    initializeSocket.mockReturnValueOnce(undefined);

    render(
      <SocketProvider>
        <p>provider child</p>
      </SocketProvider>
    );

    expect(screen.getByText('provider child')).toBeInTheDocument();
    expect(initializeSocket).toHaveBeenCalledTimes(1);
  });

  it('calls the cleanup function returned by initialiseSocket when unmounting', async () => {
    const SocketProvider = await loadProvider();

    const dispose = vi.fn();
    initializeSocket.mockReturnValueOnce(dispose);

    const { unmount } = render(
      <SocketProvider>
        <span>child</span>
      </SocketProvider>
    );

    unmount();

    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('ignores non-function cleanups without throwing', async () => {
    const SocketProvider = await loadProvider();

    initializeSocket.mockReturnValueOnce('not-a-function');

    const { unmount } = render(
      <SocketProvider>
        <div>child</div>
      </SocketProvider>
    );

    expect(() => unmount()).not.toThrow();
  });
});
