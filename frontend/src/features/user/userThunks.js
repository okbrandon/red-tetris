import { setUsername } from './userSlice.js';
import { sendClientUpdate } from '../socket/socketThunks.js';
import { store } from '../../store.js';

export const updateUsername = (username) => {
    const trimmed = typeof username === 'string' ? username.trim() : '';

    store.dispatch(setUsername(trimmed));

    if (trimmed.length > 0) {
        sendClientUpdate({ username: trimmed });
    }
};
