import { describe, it, expect } from 'vitest';
import { store } from '../store.js';

describe('store configuration', () => {
  it('exposes combined reducers with expected keys', () => {
    const state = store.getState();
    expect(state).toHaveProperty('game');
    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('notification');
    expect(state).toHaveProperty('socket');
    expect(state).toHaveProperty('playerStats');
  });

  it('allows dispatching slice actions', () => {
    store.dispatch({ type: 'user/setUsername', payload: 'Tester' });
    expect(store.getState().user.username).toBe('Tester');
  });
});
