import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import TetrisGrid from '../components/TetrisGrid';

describe('TetrisGrid', () => {
    it('renders a 10x20 grid by default (200 cells)', () => {
        renderWithProviders(<TetrisGrid />);
        const cells = screen.getAllByRole('gridcell');
        expect(cells.length).toBe(200);
    });

    it('renders filled cells when matrix is provided', () => {
        const matrix = Array.from({ length: 20 }, (_, y) =>
        Array.from({ length: 10 }, (_, x) => (y === 0 && x < 3 ? 1 : 0))
        );
        renderWithProviders(<TetrisGrid matrix={matrix} />);
        const cells = screen.getAllByTestId('cell');
        const filled = cells.filter((el) => el.dataset.filled === 'true');
        expect(filled.length).toBe(3);
    });
});
