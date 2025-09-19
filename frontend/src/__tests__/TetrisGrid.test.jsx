import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import TetrisGrid from '../components/TetrisGrid';

describe('TetrisGrid', () => {
    it('renders a 10x20 grid by default (200 cells)', () => {
        renderWithProviders(<TetrisGrid />);
        const cells = screen.getAllByRole('gridcell');
        expect(cells.length).toBe(200);
    });

    it('renders filled cells when matrix uses numeric values', () => {
        const matrix = Array.from({ length: 20 }, (_, y) =>
            Array.from({ length: 10 }, (_, x) => (y === 0 && x < 3 ? 1 : 0))
        );
        renderWithProviders(<TetrisGrid matrix={matrix} />);
        const cells = screen.getAllByTestId('cell');
        const filled = cells.filter((el) => el.dataset.filled === 'true');
        expect(filled.length).toBe(3);
    });

    it('supports server grid objects with ghost and filled cells', () => {
        const serverGrid = [
            [
                { filled: true, color: 'purple' },
                { ghost: true, color: 'ghost' },
            ],
            [
                { filled: false, color: 'transparent' },
                { indestructible: true },
            ],
        ];

        renderWithProviders(<TetrisGrid matrix={serverGrid} rows={2} cols={2} cellSize={8} />);

        const cells = screen.getAllByTestId('cell');
        const filled = cells.filter((el) => el.dataset.filled === 'true');
        const ghost = cells.filter((el) => el.dataset.ghost === 'true');

        expect(cells.length).toBe(4);
        expect(filled.length).toBe(1);
        expect(ghost.length).toBe(1);
    });
});
