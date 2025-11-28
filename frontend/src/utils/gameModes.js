export const INVISIBLE_FALLING_PIECES_MODE = 'invisible-falling-pieces';

export const SOLO_MODE_OPTIONS = [
  {
    id: 'classic',
    title: 'Classic',
    badge: 'Balanced',
    description:
      'Traditional pacing with steady gravity and familiar scoring—perfect for warming up.',
  },
  {
    id: 'fast-paced',
    title: 'Fast Paced',
    badge: 'Speed Rush',
    description:
      'Pieces fall twice as fast right from the start. Keep up or get buried.',
  },
  {
    id: INVISIBLE_FALLING_PIECES_MODE,
    title: 'Invisible Pieces',
    badge: 'Mind Game',
    description:
      'Falling pieces vanish until they land. Trust your instincts and spatial memory.',
  },
  {
    id: 'morph-falling-pieces',
    title: 'Morph Pieces',
    badge: 'Chaos Mode',
    description:
      'Pieces shapeshift on the way down. Adapt on the fly and tame the unexpected.',
  },
];

export const DEFAULT_SOLO_MODE = SOLO_MODE_OPTIONS[0].id;

export const GAME_MODE_OPTIONS = SOLO_MODE_OPTIONS;

export const getModeDetails = (modeId) =>
  SOLO_MODE_OPTIONS.find((mode) => mode.id === modeId) || null;
