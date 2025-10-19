import userReducer, { setUsername } from '../features/user/userSlice';

describe('userSlice', () => {
  it('sets username', () => {
    const state = { username: '' };
    const next = userReducer(state, setUsername('Alice'));
    expect(next.username).toBe('Alice');
  });
});
