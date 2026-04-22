import type { MusicProvider } from './types.js';

export const musicGenProvider: MusicProvider = {
  name: 'musicgen',
  async generateTrack() {
    throw new Error(
      'MusicGen provider is not implemented yet. Use MUSIC_PROVIDER=mock for now.',
    );
  },
};
