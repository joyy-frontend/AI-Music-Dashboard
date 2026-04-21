import type { MusicProvider } from './types';

export const openAiProvider: MusicProvider = {
  name: 'openai',
  async generateTrack() {
    throw new Error(
      'OpenAI music provider is not implemented yet. Use MUSIC_PROVIDER=mock for now.',
    );
  },
};
