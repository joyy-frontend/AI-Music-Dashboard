import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
HTMLMediaElement.prototype.pause = vi.fn();

vi.mock('wavesurfer.js', () => {
  return {
    default: {
      create: () => {
        const listeners = new Map<string, Array<(value?: number) => void>>();
        const mediaElement = document.createElement('audio');

        const emit = (event: string, value?: number) => {
          listeners.get(event)?.forEach((listener) => listener(value));
        };

        window.setTimeout(() => {
          emit('ready', 3);
        }, 0);

        return {
          destroy: vi.fn(),
          getCurrentTime: () => 0,
          getDuration: () => 3,
          getMediaElement: () => mediaElement,
          on: (event: string, callback: (value?: number) => void) => {
            const currentListeners = listeners.get(event) ?? [];
            listeners.set(event, [...currentListeners, callback]);
          },
          playPause: vi.fn(() => {
            emit('play');
          }),
          seekTo: vi.fn(),
        };
      },
    },
  };
});

vi.mock('../lib/echarts', () => {
  return {
    init: () => ({
      dispose: vi.fn(),
      resize: vi.fn(),
      setOption: vi.fn(),
    }),
  };
});
