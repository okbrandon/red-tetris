export const GAME_RESULT_VARIANTS = Object.freeze({
  win: {
    badge: 'Victory',
    title: 'You Won!',
    color: '#4ade80',
    background: 'rgba(74, 222, 128, 0.18)',
    shadow: '0 16px 28px rgba(74, 222, 128, 0.28)',
    defaultMessage: 'You outlasted every challenger. Nicely stacked!',
  },
  lose: {
    badge: 'Defeat',
    title: 'Game Over',
    color: '#f87171',
    background: 'rgba(248, 113, 113, 0.16)',
    shadow: '0 16px 28px rgba(248, 113, 113, 0.28)',
    defaultMessage: 'Another chance awaits. Shake it off and try again.',
  },
  info: {
    badge: 'Game Over',
    title: 'Game Finished',
    color: '#c4b5fd',
    background: 'rgba(196, 181, 253, 0.16)',
    shadow: '0 16px 28px rgba(196, 181, 253, 0.26)',
    defaultMessage: 'The match has ended. Thanks for playing!',
  },
});

const DEFAULT_VARIANT_KEY = 'info';
const DEFAULT_FALLBACK_MESSAGE = 'Game Over';

const resolveVariantKey = (outcome) => {
  const key = typeof outcome === 'string' ? outcome : outcome?.outcome;
  if (key && Object.prototype.hasOwnProperty.call(GAME_RESULT_VARIANTS, key)) {
    return key;
  }
  return DEFAULT_VARIANT_KEY;
};

export const deriveGameResultState = ({
  outcome,
  isOwner = false,
  isGameOver = false,
  canSpectate = false,
  onSpectate,
} = {}) => {
  const variantKey = resolveVariantKey(outcome);
  const variant = GAME_RESULT_VARIANTS[variantKey];

  const message =
    outcome?.message ?? variant.defaultMessage ?? DEFAULT_FALLBACK_MESSAGE;

  const waitingMessageVisible = Boolean(!isOwner && isGameOver);
  const restartVisible = Boolean(isOwner && isGameOver);
  const spectateEnabled =
    Boolean(canSpectate) && typeof onSpectate === 'function';

  return {
    variantKey,
    variant,
    message,
    waitingMessageVisible,
    restartVisible,
    spectateEnabled,
  };
};
