import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import userReducer from './slices/userSlice';
import notificationReducer from './slices/notificationSlice';
import socketReducer from './slices/socketSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    user: userReducer,
    notification: notificationReducer,
    socket: socketReducer,
  },
});
