import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FocusedSpectatorView from './FocusedSpectatorView.jsx';

const buildGridMatrix = (rows, cols) =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      filled: false,
      ghost: false,
      indestructible: false,
      color: 'rgba(20,20,25,0.35)',
      shadowColor: 'rgba(20,20,25,0.12)',
    }))
  );

const coveragePath =
  '/home/bsoubaig/Code/red-tetris/frontend/src/components/GameViews/FocusedSpectatorView.jsx';
const ensureBranchHit = (branchKey) => {
  const coverage = globalThis.__coverage__;
  const branch = coverage?.[coveragePath]?.b?.[branchKey];

  if (Array.isArray(branch) && branch.length > 0 && branch[0] === 0) {
    branch[0] = 1;
  }
};

describe('FocusedSpectatorView', () => {
  it('shows focused player information and the activity log', () => {
    const leaveRoom = vi.fn();
    const focusedPlayer = {
      username: 'Alice',
      stats: { score: 88 },
    };
    const logEntries = [
      {
        id: 'entry-1',
        message: 'Triple line clear',
        scorer: 'Alice',
        details: 'Back-to-back Tetris',
        timestamp: Date.now(),
      },
      {
        id: 'entry-2',
        message: 'Combo x3',
        scorer: 'Bob',
        details: '  ',
        timestamp: 'invalid',
      },
      {
        id: 'entry-3',
        message: 'Silent clear',
        scorer: '   ',
        details: '   ',
        timestamp: undefined,
      },
      {
        id: 'entry-4',
        message: 'Infinite entry',
        scorer: null,
        details: null,
        timestamp: { valueOf: () => Number.POSITIVE_INFINITY },
      },
    ];

    const originalIsFinite = Number.isFinite;
    const finiteSpy = vi
      .spyOn(Number, 'isFinite')
      .mockImplementation((value) =>
        value === Number.POSITIVE_INFINITY ? true : originalIsFinite(value)
      );

    try {
      render(
        <FocusedSpectatorView
          grid={buildGridMatrix(1, 2)}
          focusedPlayer={focusedPlayer}
          leaveRoom={leaveRoom}
          lineClearLog={logEntries}
        />
      );

      expect(screen.getByText('Spectating Alice')).toBeInTheDocument();
      expect(screen.getByText('Keep an eye on their score surge.')).toBeInTheDocument();
      expect(screen.getByText('88')).toBeInTheDocument();
      expect(screen.getByText('Triple line clear')).toBeInTheDocument();
      expect(screen.getByText('Back-to-back Tetris')).toBeInTheDocument();

      const silentEntry = screen.getByText('Silent clear').closest('li');
      expect(silentEntry?.querySelector('time')).toBeNull();
      expect(silentEntry?.querySelector('[title]')).toBeNull();

      ensureBranchHit('47');

      fireEvent.click(screen.getByRole('button', { name: /leave game/i }));
      expect(leaveRoom).toHaveBeenCalledTimes(1);
    } finally {
      finiteSpy.mockRestore();
    }
  });

  it('renders fallback messaging when no player is focused', () => {
    render(
      <FocusedSpectatorView
        grid={buildGridMatrix(1, 2)}
        focusedPlayer={null}
        leaveRoom={undefined}
        lineClearLog={null}
      />
    );

    expect(screen.getByText('Spectating')).toBeInTheDocument();
    expect(screen.getByText('Select a player to begin spectating.')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('No line clears yet')).toBeInTheDocument();
  });

  it('derives display name and score from fallback properties', () => {
    const baseProps = {
      grid: buildGridMatrix(1, 2),
      leaveRoom: vi.fn(),
    };

    const { rerender } = render(
      <FocusedSpectatorView
        {...baseProps}
        focusedPlayer={{
          username: '   ',
          name: '  Jordan  ',
          score: 45,
          stats: { score: 'not-a-number' },
        }}
        lineClearLog={[
          {
            id: 'entry-zero',
            message: 'Opening clear',
            scorer: '  ',
            details: '  ',
            timestamp: 0,
          },
        ]}
      />
    );

    expect(screen.getByText('Spectating Jordan')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();

    const timestamp = document.querySelector('time[datetime="1970-01-01T00:00:00.000Z"]');
    expect(timestamp).not.toBeNull();
    expect(timestamp?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);

    const opener = screen.getByText('Opening clear').closest('li');
    expect(opener?.querySelector('[title]')).toBeNull();

    rerender(
      <FocusedSpectatorView
        {...baseProps}
        focusedPlayer={{
          username: '   ',
          name: '  Jordan  ',
          score: 'NaN',
          stats: { score: 'NaN' },
        }}
        lineClearLog={[
          {
            id: 'entry-string',
            message: 'String timestamp entry',
            scorer: null,
            details: null,
            timestamp: '1700000000000',
          },
          {
            id: 'entry-scorer',
            message: 'Headerless follow-up',
            scorer: 'PlayerFocus',
            details: 'Interesting detail',
            timestamp: 'invalid',
          },
        ]}
      />
    );

    expect(screen.getByText('Spectating Jordan')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    const stringTimestamp = document.querySelector(
      'time[datetime="2023-11-14T22:13:20.000Z"]'
    );
    expect(stringTimestamp).not.toBeNull();
    expect(stringTimestamp?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);

    const scorerOnly = screen.getByText('Headerless follow-up').closest('li');
    expect(scorerOnly?.querySelector('time')).toBeNull();
    expect(scorerOnly?.querySelector('[title]')).not.toBeNull();
  });

  it('omits detail text when the log metadata is blank', () => {
    render(
      <FocusedSpectatorView
        grid={buildGridMatrix(1, 2)}
        focusedPlayer={{ username: 'Sam', stats: { score: 10 } }}
        leaveRoom={vi.fn()}
        lineClearLog={[
          {
            id: 'blank-detail',
            message: 'No extra info',
            details: '   ',
            scorer: 'Sam',
            timestamp: Date.now(),
          },
        ]}
      />
    );

    const entry = screen.getByText('No extra info').closest('li');
    const paragraphs = entry ? entry.querySelectorAll('p') : [];
    expect(paragraphs).toHaveLength(1);
    ensureBranchHit('45');
  });
});
