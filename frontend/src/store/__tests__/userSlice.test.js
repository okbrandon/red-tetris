import { describe, it, expect } from 'vitest';
import reducer, {
  setUsername,
  setServerIdentity,
  resetUser,
} from '../slices/userSlice.js';

const init = () => reducer(undefined, { type: '@@INIT' });

describe('userSlice', () => {
  it('sets the username directly', () => {
    const state = reducer(init(), setUsername('Alice'));
    expect(state.username).toBe('Alice');
  });

  it('allows partial identity updates', () => {
    const afterId = reducer(init(), setServerIdentity({ id: 'id-1' }));
    expect(afterId.id).toBe('id-1');

    const afterUsername = reducer(
      afterId,
      setServerIdentity({ username: 'Bob' })
    );
    expect(afterUsername).toMatchObject({ id: 'id-1', username: 'Bob' });

    const unchanged = reducer(afterUsername, setServerIdentity());
    expect(unchanged).toEqual(afterUsername);
  });

  it('resets to defaults', () => {
    const populated = reducer(
      init(),
      setServerIdentity({ id: 'x', username: 'y' })
    );
    const reset = reducer(populated, resetUser());
    expect(reset).toEqual(init());
  });
});
