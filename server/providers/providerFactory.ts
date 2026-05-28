import { musicGenProvider } from './musicGenProvider.js';
import { mockProvider } from './mockProvider.js';
import { openAiProvider } from './openAiProvider.js';
import type { MusicProvider, MusicProviderName } from './types.js';

function isMusicProviderName(value: string): value is MusicProviderName {
  return value === 'mock' || value === 'openai' || value === 'musicgen';
}

export function getMusicProvider(): MusicProvider {
  const providerName = process.env.MUSIC_PROVIDER ?? 'musicgen';

  if (!isMusicProviderName(providerName)) {
    throw new Error(`Unsupported music provider: ${providerName}`);
  }

  const providers: Record<MusicProviderName, MusicProvider> = {
    mock: mockProvider,
    openai: openAiProvider,
    musicgen: musicGenProvider,
  };

  return providers[providerName];
}
