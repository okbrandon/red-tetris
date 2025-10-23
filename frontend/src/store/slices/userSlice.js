import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: '',
  id: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setServerIdentity: (state, action) => {
      const { id, username } = action.payload ?? {};
      if (id !== undefined) {
        state.id = id;
      }
      if (username) {
        state.username = username;
      }
    },
    resetUser: () => initialState,
  },
});

export const { setUsername, setServerIdentity, resetUser } = userSlice.actions;
export default userSlice.reducer;
