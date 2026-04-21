import { musicGenProvider } from './musicGenProvider';
import { mockProvider } from './mockProvider';
import { openAiProvider } from './openAiProvider';
import type { MusicProvider, MusicProviderName } from './types';

function isMusicProviderName(value: string): value is MusicProviderName {
  return value === 'mock' || value === 'openai' || value === 'musicgen';
}

export function getMusicProvider(): MusicProvider {
  const providerName = process.env.MUSIC_PROVIDER ?? 'mock';

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
