import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import gameReducer from './features/game/gameSlice';

export function renderWithProviders(
    ui,
    { route = '/', preloadedState, store, withRouter = true } = {}
) {
    const testStore =
        store ||
        configureStore({
            reducer: { user: userReducer, game: gameReducer },
            preloadedState,
        });

    if (withRouter) {
        window.history.pushState({}, 'Test page', route);
    }

    const Wrapped = (
        <Provider store={testStore}>
            {withRouter ? (
                <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
            ) : (
                ui
            )}
        </Provider>
    );

    return {
        store: testStore,
        ...render(Wrapped),
    };
}
