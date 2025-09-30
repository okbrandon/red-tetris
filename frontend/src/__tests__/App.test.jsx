import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import App from '../App';

describe('App routing', () => {
    it('renders HomePage by default', () => {
        renderWithProviders(<App />, { withRouter: false });
        expect(screen.getByText(/red-tetris/i)).toBeInTheDocument();
    });
});
