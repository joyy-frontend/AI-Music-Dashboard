import type { GenerateTrackInput } from '../../src/types/music';
import type { MusicProvider } from './types';

function createMockAudioUrl() {
  const sampleRate = 22050;
  const seconds = 3;
  const sampleCount = sampleRate * seconds;
  const headerSize = 44;
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(headerSize + sampleCount * bytesPerSample);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + sampleCount * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, sampleCount * bytesPerSample, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const envelope = Math.sin((Math.PI * index) / sampleCount);
    const tone =
      Math.sin(2 * Math.PI * 220 * time) * 0.45 +
      Math.sin(2 * Math.PI * 330 * time) * 0.25;

    view.setInt16(
      headerSize + index * bytesPerSample,
      tone * envelope * 0x7fff,
      true,
    );
  }

  return `data:audio/wav;base64,${Buffer.from(buffer).toString('base64')}`;
}

function createTitle(input: GenerateTrackInput) {
  const promptSeed = input.prompt.trim().split(/\s+/).slice(0, 4).join(' ');
  const titleBase = promptSeed || `${input.mood} ${input.genre}`;

  return `${titleBase} Sketch`;
}

export const mockProvider: MusicProvider = {
  name: 'mock',
  generateTrack(input) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (input.prompt.toLowerCase().includes('error')) {
          reject(new Error('Mock generation failed. Please try another prompt.'));
          return;
        }

        resolve({
          title: createTitle(input),
          duration: '2:48',
          audioUrl: createMockAudioUrl(),
          genre: input.genre,
          mood: input.mood,
        });
      }, 1500);
    });
  },
};
