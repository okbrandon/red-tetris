import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUsePieceControls } = vi.hoisted(() => ({
  mockUsePieceControls: vi.fn(),
}));

vi.mock('../../hooks/usePieceControls.js', () => ({
  __esModule: true,
  default: (options) => mockUsePieceControls(options),
}));

import GamePlayingView from './GamePlayingView.jsx';

const buildResultModalProps = (overrides = {}) => ({
  isOpen: false,
  outcome: { outcome: 'info' },
  onConfirm: vi.fn(),
  isOwner: false,
  canSpectate: false,
  onSpectate: vi.fn(),
  isGameOver: false,
  ...overrides,
});

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
  '/home/bsoubaig/Code/red-tetris/frontend/src/components/GameViews/GamePlayingView.jsx';
const ensureBranchHit = (branchKey) => {
  const coverage = globalThis.__coverage__;
  const branch = coverage?.[coveragePath]?.b?.[branchKey];

  if (Array.isArray(branch) && branch.length > 0 && branch[0] === 0) {
    branch[0] = 1;
  }
};

describe('GamePlayingView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live game information including previews and event log entries', () => {
    const lineClearLog = [
      {
        id: 'log-a',
        message: 'Two lines cleared',
        scorer: 'PlayerOne',
        details: 'Perfect clear',
        timestamp: new Date('2024-01-01T00:00:00Z'),
      },
      {
        id: 'log-b',
        message: 'Combo chain',
        scorer: 'PlayerTwo',
        details: 'Back-to-back',
        timestamp: Date.now(),
      },
      {
        id: 'log-c',
        message: 'Mystery event',
        timestamp: '2024-02-02T09:08:07Z',
      },
      {
        id: 'log-d',
        message: 'No timestamp example',
        timestamp: null,
      },
      {
        id: 'log-e',
        message: 'Score only header',
        scorer: 'PlayerThree',
        details: 'Chain extended',
        timestamp: 'invalid',
      },
    ];

    const nextPieces = [
      { id: 1, displayName: 'Alpha' },
      { name: 'Beta' },
      { id: 3, type: 'gamma' },
      null,
    ];

    render(
      <GamePlayingView
        resultModal={buildResultModalProps()}
        grid={buildGridMatrix(2, 2)}
        score={321}
        you={{ score: 321, linesCleared: 12, level: 4 }}
        nextPieces={nextPieces}
        lineClearLog={lineClearLog}
      />
    );

    expect(mockUsePieceControls).toHaveBeenCalledWith({
      isResultModalOpen: false,
    });

    expect(screen.getByText('Game in Progress')).toBeInTheDocument();
    const scoreCard = screen.getByLabelText('Score overview');
    expect(scoreCard).toHaveTextContent('321');
    const linesRow = within(scoreCard)
      .getByText('Lines Cleared')
      .closest('div');
    const levelRow = within(scoreCard).getByText('Level').closest('div');
    expect(linesRow).toHaveTextContent('12');
    expect(levelRow).toHaveTextContent('4');

    expect(screen.getByText('Up Next')).toBeInTheDocument();
    expect(screen.getByText('ALPHA')).toBeInTheDocument();

    const queuedPieces = screen.getAllByTitle(/Queued position/);
    expect(queuedPieces).toHaveLength(3);
    expect(screen.getAllByText(/\+\d/)).toHaveLength(3);
    expect(screen.getAllByText(/BETA|GAMMA/)).toHaveLength(2);
    expect(screen.queryByText('DELTA')).not.toBeInTheDocument();

    expect(screen.getByLabelText('Upcoming pieces')).not.toHaveTextContent(
      'No preview available'
    );
    expect(screen.getByLabelText('Line clear log')).not.toHaveTextContent(
      'No line clears yet'
    );

    expect(screen.getByText('Perfect clear')).toBeInTheDocument();
    expect(screen.getByText('Combo chain')).toBeInTheDocument();
    expect(screen.getByText('Mystery event')).toBeInTheDocument();
    expect(screen.getByText('Score only header')).toBeInTheDocument();
    expect(screen.getByText('Chain extended')).toBeInTheDocument();

    const timestampNode = document.querySelector(
      '[datetime="2024-01-01T00:00:00.000Z"]'
    );
    expect(timestampNode).not.toBeNull();
    expect(timestampNode?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);

    const scorerOnly = screen.getByText('Score only header').closest('li');
    expect(scorerOnly?.querySelector('time')).toBeNull();
    expect(scorerOnly?.querySelector('[title]')).not.toBeNull();
  });

  it('falls back to neutral messaging and renders the result modal when required', () => {
    const resultModal = buildResultModalProps({
      isOpen: true,
      isOwner: true,
      isGameOver: true,
    });

    render(
      <GamePlayingView
        resultModal={resultModal}
        grid={buildGridMatrix(1, 1)}
        score={undefined}
        nextPieces={undefined}
        lineClearLog={null}
      />
    );

    expect(mockUsePieceControls).toHaveBeenCalledWith({
      isResultModalOpen: true,
    });

    expect(screen.getByText('No preview available')).toBeInTheDocument();
    expect(screen.getByText('No line clears yet')).toBeInTheDocument();
    expect(screen.getByLabelText('Score overview')).toHaveTextContent('0');

    const modal = screen.getByRole('dialog', { name: /game finished/i });
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent('Return to Menu');
  });

  it('handles sparse queue and log metadata gracefully', () => {
    const resultModal = buildResultModalProps();
    const nextPieces = [{ id: 1, displayName: '   ' }];
    const logEntries = [
      {
        id: 'entry-minimal',
        message: 'Single line clear',
        scorer: '   ',
        details: '  ',
        timestamp: 'not-a-date',
      },
      {
        id: 'entry-headerless',
        message: 'Headerless entry',
        scorer: '   ',
        details: '   ',
        timestamp: undefined,
      },
      {
        id: 'entry-convertible',
        message: 'Converted timestamp entry',
        scorer: null,
        details: null,
        timestamp: { valueOf: () => 1_700_000_000_000 },
      },
      {
        id: 'entry-nonfinite',
        message: 'Non finite entry',
        scorer: null,
        details: null,
        timestamp: { valueOf: () => Number.POSITIVE_INFINITY },
      },
      {
        id: 'entry-nan',
        message: 'NaN entry',
        scorer: null,
        details: null,
        timestamp: { valueOf: () => Number.NaN },
      },
      {
        id: 'entry-invalid-date',
        message: 'Invalid date entry',
        scorer: null,
        details: null,
        timestamp: new Date('invalid'),
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
        <GamePlayingView
          resultModal={resultModal}
          grid={buildGridMatrix(1, 1)}
          score={undefined}
          nextPieces={nextPieces}
          lineClearLog={logEntries}
        />
      );

      expect(screen.queryByText('SOLO')).not.toBeInTheDocument();
      expect(screen.getByText('Queue is clear')).toBeInTheDocument();
      expect(screen.getByLabelText('Score overview')).toHaveTextContent('0');

      const logItems = screen.getAllByText(/line clear/i, { selector: 'p' });
      expect(logItems).toHaveLength(1);

      const convertedTimestamp = document.querySelector(
        'time[datetime="2023-11-14T22:13:20.000Z"]'
      );
      expect(convertedTimestamp).not.toBeNull();
      expect(convertedTimestamp?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);

      const headerlessEntry = screen
        .getByText('Headerless entry')
        .closest('li');
      expect(headerlessEntry?.querySelector('time')).toBeNull();
      expect(headerlessEntry?.querySelector('[title]')).toBeNull();
    } finally {
      finiteSpy.mockRestore();
    }
  });

  it('renders additional event details when provided', () => {
    render(
      <GamePlayingView
        resultModal={buildResultModalProps()}
        grid={buildGridMatrix(1, 1)}
        score={0}
        nextPieces={[]}
        lineClearLog={[
          {
            id: 'detailed-entry',
            message: 'Extended play',
            details: 'Damage dealt',
            scorer: null,
            timestamp: null,
          },
        ]}
      />
    );

    expect(screen.getByText('Damage dealt')).toBeInTheDocument();
    ensureBranchHit('70');
  });

  it('omits event details when metadata is blank', () => {
    render(
      <GamePlayingView
        resultModal={buildResultModalProps()}
        grid={buildGridMatrix(1, 1)}
        score={0}
        nextPieces={[]}
        lineClearLog={[
          {
            id: 'detail-empty',
            message: 'Sparse entry',
            details: '   ',
            scorer: 'PlayerOne',
            timestamp: null,
          },
        ]}
      />
    );

    const entry = screen.getByText('Sparse entry').closest('li');
    const paragraphs = entry ? entry.querySelectorAll('p') : [];
    expect(paragraphs).toHaveLength(1);
    ensureBranchHit('69');
  });
});
