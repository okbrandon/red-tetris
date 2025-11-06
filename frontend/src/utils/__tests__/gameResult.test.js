import { GAME_RESULT_VARIANTS, deriveGameResultState } from '../gameResult.js';

describe('gameResult utilities', () => {
  it('uses variant details matching the outcome key', () => {
    const state = deriveGameResultState({ outcome: 'win' });

    expect(state.variantKey).toBe('win');
    expect(state.variant).toBe(GAME_RESULT_VARIANTS.win);
    expect(state.message).toBe(GAME_RESULT_VARIANTS.win.defaultMessage);
  });

  it('falls back to the info variant when the outcome is unknown', () => {
    const state = deriveGameResultState({ outcome: 'mystery' });

    expect(state.variantKey).toBe('info');
  });

  it('prefers custom outcome objects for messaging', () => {
    const state = deriveGameResultState({
      outcome: { outcome: 'lose', message: 'Eliminated!' },
      isOwner: true,
      isGameOver: true,
      canSpectate: true,
      onSpectate: () => {},
    });

    expect(state.message).toBe('Eliminated!');
    expect(state.restartVisible).toBe(true);
    expect(state.waitingMessageVisible).toBe(false);
    expect(state.spectateEnabled).toBe(true);
  });

  it('shows the waiting message for non-owners at game over', () => {
    const state = deriveGameResultState({
      outcome: { outcome: 'info' },
      isOwner: false,
      isGameOver: true,
      canSpectate: true,
    });

    expect(state.waitingMessageVisible).toBe(true);
    expect(state.restartVisible).toBe(false);
    expect(state.spectateEnabled).toBe(false);
  });

  it('falls back cleanly when the outcome object lacks a key', () => {
    const state = deriveGameResultState({
      outcome: { message: 'No result' },
      isOwner: true,
      isGameOver: false,
      canSpectate: true,
      onSpectate: 'not-a-function',
    });

    expect(state.variantKey).toBe('info');
    expect(state.message).toBe('No result');
    expect(state.spectateEnabled).toBe(false);
  });
  it('falls back to the default message when the variant lacks one', () => {
    const lightweightVariants = Object.freeze({
      info: {
        badge: 'Game Over',
        title: 'Game Finished',
        background: 'transparent',
        color: '#ffffff',
        shadow: 'none',
      },
    });

    const state = deriveGameResultState(
      { outcome: 'info' },
      lightweightVariants
    );

    expect(state.variant).toBe(lightweightVariants.info);
    expect(state.message).toBe('Game Over');
  });

  it('uses the default variant when the resolved entry is undefined', () => {
    const variants = Object.freeze({
      win: undefined,
      info: {
        badge: 'Fallback',
        title: 'Fallback Title',
        defaultMessage: 'Default body',
      },
    });

    const state = deriveGameResultState({ outcome: 'win' }, variants);

    expect(state.variantKey).toBe('win');
    expect(state.variant).toBe(variants.info);
    expect(state.message).toBe('Default body');
  });

  it('provides a safe empty variant when no defaults are defined', () => {
    const emptyVariants = Object.freeze({});

    const state = deriveGameResultState({ outcome: 'win' }, emptyVariants);

    expect(state.variantKey).toBe('info');
    expect(state.variant).toEqual({});
    expect(state.message).toBe('Game Over');
  });
});
