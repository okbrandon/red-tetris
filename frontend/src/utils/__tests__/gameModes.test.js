import {
  DEFAULT_SOLO_MODE,
  GAME_MODE_OPTIONS,
  SOLO_MODE_OPTIONS,
  getModeDetails,
} from '../gameModes.js';

describe('gameModes utilities', () => {
  it('exposes consistent option references', () => {
    expect(GAME_MODE_OPTIONS).toBe(SOLO_MODE_OPTIONS);
    expect(DEFAULT_SOLO_MODE).toBe(SOLO_MODE_OPTIONS[0].id);
  });

  it('retrieves mode details when the id exists', () => {
    const classic = getModeDetails('classic');

    expect(classic).toMatchObject({ id: 'classic', title: expect.any(String) });
  });

  it('returns null for unknown modes', () => {
    expect(getModeDetails('nope')).toBeNull();
  });
});
