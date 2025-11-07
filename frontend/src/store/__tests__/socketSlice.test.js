import { describe, it, expect } from 'vitest';
import reducer, {
  connectRequested,
  connectSucceeded,
  connectFailed,
  socketDisconnected,
  socketEventReceived,
  clearSocketEvent,
  resetSocketState,
} from '../slices/socketSlice.js';

const init = () => reducer(undefined, { type: '@@INIT' });

describe('socketSlice', () => {
  it('handles lifecycle reducers', () => {
    const requested = reducer(init(), connectRequested());
    expect(requested.status).toBe('connecting');
    expect(requested.lastError).toBeNull();

    const success = reducer(requested, connectSucceeded('id-1'));
    expect(success.status).toBe('connected');
    expect(success.socketId).toBe('id-1');

    const fallbackSuccess = reducer(success, connectSucceeded());
    expect(fallbackSuccess.socketId).toBeNull();

    const failed = reducer(fallbackSuccess, connectFailed('nope'));
    expect(failed.status).toBe('error');
    expect(failed.lastError).toBe('nope');

    const defaultFailed = reducer(failed, connectFailed());
    expect(defaultFailed.lastError).toBe('Unknown connection error');

    const disconnected = reducer(defaultFailed, socketDisconnected('bye'));
    expect(disconnected.status).toBe('disconnected');
    expect(disconnected.lastError).toBe('bye');
    expect(disconnected.socketId).toBeNull();

    const defaultDisconnected = reducer(disconnected, socketDisconnected());
    expect(defaultDisconnected.lastError).toBeNull();
  });

  it('tracks socket events and clearing', () => {
    const eventState = reducer(
      init(),
      socketEventReceived({ type: 'foo', payload: 1 })
    );
    expect(eventState.lastEvent).toEqual({ type: 'foo', payload: 1 });

    const cleared = reducer(eventState, clearSocketEvent());
    expect(cleared.lastEvent).toBeNull();
  });

  it('resets to the initial state', () => {
    const mutated = reducer(init(), connectFailed('error'));
    const reset = reducer(mutated, resetSocketState());

    expect(reset).toEqual(init());
  });
});
