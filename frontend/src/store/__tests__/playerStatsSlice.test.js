import { describe, it, expect, vi } from 'vitest';
import reducer, {
  setPlayerHistory,
  resetPlayerHistory,
} from '../slices/playerStatsSlice.js';

const init = () => reducer(undefined, { type: '@@INIT' });

describe('playerStatsSlice', () => {
  it('normalizes history entries and limits them to five', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1111);

    const entries = Array.from({ length: 7 }, (_, index) => ({ id: index }));
    const state = reducer(init(), setPlayerHistory(entries));

    expect(state.history).toHaveLength(5);
    expect(state.history[0]).toEqual({ id: 0 });
    expect(state.lastUpdatedAt).toBe(1111);
    nowSpy.mockRestore();
  });

  it('resets back to the initial state', () => {
    const populated = reducer(init(), setPlayerHistory([{ id: 1 }]));
    const reset = reducer(populated, resetPlayerHistory());

    expect(reset.history).toEqual([]);
    expect(reset.lastUpdatedAt).toBeNull();
  });

  it('handles non-array payloads gracefully', () => {
    const state = reducer(init(), setPlayerHistory(null));

    expect(state.history).toEqual([]);
  });
});
