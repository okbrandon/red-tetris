import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const loadEventsModule = async () => {
  vi.resetModules();
  return import('../socket/events.js');
};

describe('socket events definitions', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exposes frozen maps of client and server events', async () => {
    const events = await loadEventsModule();

    expect(Object.isFrozen(events.CLIENT_EVENTS)).toBe(true);
    expect(Object.isFrozen(events.SERVER_EVENTS)).toBe(true);
    expect(events.CLIENT_EVENTS.START_GAME).toBe('start-game');
    expect(events.SERVER_EVENTS.GAME_STATE).toBe('game-state');
    expect(events.SOCKET_EVENTS.CONNECT).toBe('connect');
  });

  it('derives localhost defaults when no environment overrides exist', async () => {
    const events = await loadEventsModule();

    expect(events.HOST_NAME).toBe('localhost');
    expect(events.SOCKET_URL).toBe('http://localhost:3000');
  });

  it('injects the configured host into the templated socket url', async () => {
    vi.stubEnv('VITE_HOST_NAME', 'play.example');
    vi.stubEnv('VITE_SOCKET_URL', 'wss://HOST_NAME:8443');

    const events = await loadEventsModule();

    expect(events.HOST_NAME).toBe('play.example');
    expect(events.SOCKET_URL).toBe('wss://play.example:8443');
  });

  it('honours custom socket urls that omit the host placeholder', async () => {
    vi.stubEnv('VITE_HOST_NAME', 'ignored-host');
    vi.stubEnv('VITE_SOCKET_URL', 'https://fixed-endpoint/socket');

    const events = await loadEventsModule();

    expect(events.HOST_NAME).toBe('ignored-host');
    expect(events.SOCKET_URL).toBe('https://fixed-endpoint/socket');
  });
});
