import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/store/slices/socketThunks.js', () => ({
  requestRestartGame: vi.fn(),
}));

import { requestRestartGame } from '@/store/slices/socketThunks.js';
import * as gameResult from '@/utils/gameResult.js';
import GameResultModal from './GameResultModal.jsx';

describe('GameResultModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('derives the view state using the helper utility', () => {
    const onConfirm = vi.fn();
    const onSpectate = vi.fn();
    const deriveSpy = vi.spyOn(gameResult, 'deriveGameResultState');

    render(
      <GameResultModal
        outcome={{ outcome: 'win' }}
        onConfirm={onConfirm}
        onSpectate={onSpectate}
        isOwner
        isGameOver
        canSpectate
      />
    );

    expect(deriveSpy).toHaveBeenCalledWith({
      outcome: { outcome: 'win' },
      isOwner: true,
      isGameOver: true,
      canSpectate: true,
      onSpectate,
    });

    deriveSpy.mockRestore();
  });

  it('renders restart and confirm actions for the host', () => {
    const onConfirm = vi.fn();

    render(
      <GameResultModal
        outcome={{ outcome: 'win', message: 'Custom victory!' }}
        onConfirm={onConfirm}
        isOwner
        isGameOver
      />
    );

    expect(screen.getByText('Victory')).toBeInTheDocument();
    expect(screen.getByText('Custom victory!')).toBeInTheDocument();
    expect(screen.queryByText('Waiting for host...')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /restart game/i }));
    expect(requestRestartGame).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /return to menu/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('prompts non-host players to wait or spectate when available', () => {
    const onConfirm = vi.fn();
    const onSpectate = vi.fn();

    render(
      <GameResultModal
        outcome={{ outcome: 'lose', message: 'Better luck next time.' }}
        onConfirm={onConfirm}
        isOwner={false}
        isGameOver
        canSpectate
        onSpectate={onSpectate}
      />
    );

    expect(screen.getByText('Waiting for host...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /restart game/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /spectate match/i }));
    expect(onSpectate).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /return to menu/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('applies board placement styling and default badge fallbacks', () => {
    const onConfirm = vi.fn();
    const deriveSpy = vi
      .spyOn(gameResult, 'deriveGameResultState')
      .mockReturnValue({
        variant: { badge: 'Result', title: 'Match Complete' },
        message: 'All rounds resolved.',
        waitingMessageVisible: false,
        restartVisible: false,
        spectateEnabled: false,
      });

    render(
      <GameResultModal
        outcome={null}
        onConfirm={onConfirm}
        isOwner={false}
        placement="board"
      />
    );

    const overlay = screen.getByRole('presentation');
    const overlayStyles = window.getComputedStyle(overlay);
    expect(overlayStyles.position).toBe('absolute');
    expect(overlayStyles.zIndex).toBe('5');

    const badge = screen.getByText('Result');
    const badgeStyles = window.getComputedStyle(badge);
    expect(badgeStyles.backgroundColor).not.toBe('');
    expect(badgeStyles.boxShadow).not.toBe('none');

    fireEvent.click(screen.getByRole('button', { name: /return to menu/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    deriveSpy.mockRestore();
  });
});
