import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './features/game/gameSlice';
import userReducer from './features/user/userSlice';
import lobbyReducer from './features/lobby/lobbySlice';
import notificationReducer from './features/notification/notificationSlice';

export const store = configureStore({
    reducer: {
        game: gameReducer,
        user: userReducer,
        lobby: lobbyReducer,
        notification: notificationReducer,
    },
});
