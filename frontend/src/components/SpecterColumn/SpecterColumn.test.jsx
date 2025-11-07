/* eslint-disable react/prop-types */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { deriveCardScaleMock, estimateOpponentCellSizeMock, mockTetrisGrid } =
  vi.hoisted(() => ({
    deriveCardScaleMock: vi.fn(),
    estimateOpponentCellSizeMock: vi.fn(),
    mockTetrisGrid: vi.fn(() => <div data-testid="specter-grid" />),
  }));

vi.mock('@/utils/arenaSizing', () => ({
  __esModule: true,
  deriveCardScale: deriveCardScaleMock,
  estimateOpponentCellSize: estimateOpponentCellSizeMock,
}));

vi.mock('../TetrisGrid/TetrisGrid', () => ({
  __esModule: true,
  default: (props) => mockTetrisGrid(props),
}));

vi.mock('./SpecterColumn.styles', async (importOriginal) => {
  const actual = await importOriginal();

  const wrapWithTestId = (Component, testId) => {
    const Wrapped = React.forwardRef((props, ref) => (
      <Component ref={ref} data-testid={testId} {...props} />
    ));
    Wrapped.displayName = `Test${Component.displayName || Component.name || 'Component'}`;
    return Wrapped;
  };

  return {
    __esModule: true,
    ...actual,
    SpecterColumnContainer: wrapWithTestId(
      actual.SpecterColumnContainer,
      'specter-column'
    ),
    SpecterGrid: wrapWithTestId(actual.SpecterGrid, 'specter-grid-wrapper'),
    SpecterCard: wrapWithTestId(actual.SpecterCard, 'specter-card'),
    SpecterBadge: wrapWithTestId(actual.SpecterBadge, 'specter-badge'),
    SpecterName: wrapWithTestId(actual.SpecterName, 'specter-name'),
    MiniBoard: wrapWithTestId(actual.MiniBoard, 'mini-board'),
  };
});

vi.mock('@/pages/Arena/MultiArenaPage/MultiArenaPage.styles', () => ({
  __esModule: true,
  SectionLabel: ({ children }) => (
    <h2 data-testid="section-label">{children}</h2>
  ),
}));

import SpecterColumn from './SpecterColumn.jsx';

describe('SpecterColumn', () => {
  beforeEach(() => {
    deriveCardScaleMock.mockReset().mockReturnValue(0.85);
    estimateOpponentCellSizeMock.mockReset().mockReturnValue(18);
    mockTetrisGrid.mockClear();
  });

  it('shows an empty state when there are no opponents', () => {
    render(
      <SpecterColumn
        opponents={[]}
        isInteractive={false}
        selectedId={undefined}
        setSelectedId={vi.fn()}
      />
    );

    expect(deriveCardScaleMock).toHaveBeenCalledWith(0);
    expect(estimateOpponentCellSizeMock).toHaveBeenCalledWith(0);
    expect(screen.getByTestId('section-label').textContent.trim()).toBe(
      'Opponents'
    );
    expect(screen.getByText('Waiting for challengers...')).toBeInTheDocument();
  });

  it('renders opponent boards with interactive controls when enabled', () => {
    const opponents = [
      { id: 'alpha', username: 'Player One', specter: [[{ filled: true }]] },
      { id: 'beta', username: 'Player Two', specter: [[{ filled: false }]] },
      {
        username: 'Player Three',
        name: 'Fallback',
        specter: [[{ filled: true }]],
      },
    ];
    const setSelectedId = vi.fn();

    render(
      <SpecterColumn
        opponents={opponents}
        isInteractive
        selectedId="beta"
        setSelectedId={setSelectedId}
      />
    );

    const column = screen.getByTestId('specter-column');
    expect(column.style.getPropertyValue('--card-scale')).toBe('0.85');

    expect(deriveCardScaleMock).toHaveBeenCalledWith(opponents.length);
    expect(estimateOpponentCellSizeMock).toHaveBeenCalledWith(opponents.length);

    const cards = screen.getAllByTestId('specter-card');
    expect(cards).toHaveLength(opponents.length);
    expect(cards[0].dataset.active).toBe('false');
    expect(cards[1].dataset.active).toBe('true');
    expect(cards[2].dataset.active).toBe('false');
    expect(cards[0].dataset.interactive).toBe('true');

    const badges = screen.getAllByTestId('specter-badge');
    expect(badges.map((badge) => badge.textContent)).toEqual([
      'Player 1',
      'Player 2',
      'Player 3',
    ]);

    const names = screen.getAllByTestId('specter-name');
    expect(names.map((name) => name.textContent)).toEqual([
      'Player One',
      'Player Two',
      'Player Three',
    ]);

    expect(mockTetrisGrid).toHaveBeenCalledTimes(opponents.length);
    expect(mockTetrisGrid.mock.calls[0][0]).toMatchObject({
      grid: opponents[0].specter,
      cellSize: 18,
    });

    fireEvent.click(cards[0]);
    expect(setSelectedId).toHaveBeenCalledWith('alpha');

    fireEvent.click(cards[2]);
    expect(setSelectedId).toHaveBeenLastCalledWith(null);
  });

  it('renders static opponent cards when interactivity is disabled', () => {
    const opponents = [
      { username: 'Fallback Name', specter: [[{ filled: false }]] },
    ];

    render(
      <SpecterColumn
        opponents={opponents}
        isInteractive={false}
        selectedId={undefined}
        setSelectedId={vi.fn()}
      />
    );

    expect(deriveCardScaleMock).toHaveBeenCalledWith(opponents.length);
    expect(estimateOpponentCellSizeMock).toHaveBeenCalledWith(opponents.length);

    const card = screen.getByTestId('specter-card');
    expect(card.dataset.interactive).toBe('false');
    expect(card.dataset.active).toBe('false');
    expect(card.getAttribute('role')).toBeNull();

    expect(screen.getByTestId('specter-name').textContent).toBe(
      'Fallback Name'
    );
  });

  it('falls back through opponent identifiers when generating keys', () => {
    const opponents = [
      { name: 'Display Name', specter: [[{ filled: false }]] },
      { specter: [[{ filled: true }]] },
    ];

    render(
      <SpecterColumn
        opponents={opponents}
        isInteractive
        selectedId={null}
        setSelectedId={vi.fn()}
      />
    );

    expect(deriveCardScaleMock).toHaveBeenCalledWith(opponents.length);
    expect(estimateOpponentCellSizeMock).toHaveBeenCalledWith(opponents.length);
    expect(screen.getAllByTestId('specter-card')).toHaveLength(
      opponents.length
    );
    expect(mockTetrisGrid).toHaveBeenCalledTimes(opponents.length);
  });
});
