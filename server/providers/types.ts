import type { GeneratedTrack, GenerateTrackInput } from '../../src/types/music.js';

export type MusicProviderName = 'mock' | 'openai' | 'musicgen';

export type MusicProvider = {
  name: MusicProviderName;
  generateTrack(input: GenerateTrackInput): Promise<GeneratedTrack>;
};
