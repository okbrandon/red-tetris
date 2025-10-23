import { setUsername } from './userSlice.js';
import { sendClientUpdate } from './socketThunks.js';
import { store } from '../store.js';

export const updateUsername = (username) => {
  const trimmed = typeof username === 'string' ? username.trim() : '';

  store.dispatch(setUsername(trimmed));

  if (typeof window !== 'undefined') {
    if (trimmed.length > 0) {
      window.localStorage.setItem('username', trimmed);
    } else {
      window.localStorage.removeItem('username');
    }
  }

  if (trimmed.length > 0) {
    sendClientUpdate({ username: trimmed });
  }
};
