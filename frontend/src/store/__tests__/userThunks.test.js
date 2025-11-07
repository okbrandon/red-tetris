import { describe, it, expect, beforeEach, vi } from 'vitest';

const dispatch = vi.fn();
const mockedStore = { dispatch, getState: vi.fn(() => ({})) };
const sendClientUpdate = vi.fn();

vi.mock('../store.js', () => ({ store: mockedStore }));
vi.mock('../slices/socketThunks.js', () => ({ sendClientUpdate }));

const loadModule = async () => {
  const module = await import('../slices/userThunks.js');
  return module.updateUsername;
};

describe('updateUsername thunk', () => {
  beforeEach(() => {
    dispatch.mockClear();
    sendClientUpdate.mockClear();
    mockedStore.dispatch = dispatch;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    });
  });

  it('trims user input, persists it, and notifies the server', async () => {
    const updateUsername = await loadModule();

    updateUsername('  Alice  ');

    expect(dispatch).toHaveBeenCalledWith({
      type: 'user/setUsername',
      payload: 'Alice',
    });
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'username',
      'Alice'
    );
    expect(sendClientUpdate).toHaveBeenCalledWith({ username: 'Alice' });
  });

  it('removes persisted value when the username is empty', async () => {
    const updateUsername = await loadModule();

    updateUsername('   ');

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('username');
    expect(sendClientUpdate).not.toHaveBeenCalled();
  });

  it('ignores non-string usernames', async () => {
    const updateUsername = await loadModule();

    updateUsername(null);

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('username');
    expect(sendClientUpdate).not.toHaveBeenCalled();
  });
});
