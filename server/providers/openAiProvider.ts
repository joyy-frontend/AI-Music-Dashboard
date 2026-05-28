import type { MusicProvider } from './types.js';

export const openAiProvider: MusicProvider = {
  name: 'openai',
  async generateTrack() {
    throw new Error(
      'OpenAI music provider is not implemented yet. Use MUSIC_PROVIDER=musicgen for now.',
    );
  },
};
