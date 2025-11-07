import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isVisible: false,
  message: '',
  type: 'info',
  duration: 4000,
  id: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      const { message, type = 'info', duration = 4000 } = action.payload;
      state.isVisible = true;
      state.message = message;
      state.type = type;
      state.duration =
        Number.isFinite(duration) && duration > 0
          ? duration
          : initialState.duration;
      state.id = Date.now();
    },
    hideNotification: (state) => {
      state.isVisible = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
