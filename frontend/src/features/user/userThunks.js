import { setUsername } from './userSlice.js';
import { sendClientUpdate } from '../socket/socketThunks.js';

export const updateUsername = (username) => (dispatch) => {
    const trimmed = typeof username === 'string' ? username.trim() : '';

    dispatch(setUsername(trimmed));

    if (trimmed.length > 0) {
        dispatch(sendClientUpdate({ username: trimmed }));
    }
};
