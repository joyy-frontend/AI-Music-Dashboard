import type { GenerateTrackInput } from '../../src/types/music.js';
import type { MusicProvider } from './types.js';

type MockAudioPreset = {
  duration: string;
  frequencies: [number, number, number];
  groove: 'slow' | 'steady' | 'pulse' | 'spark';
  seconds: number;
};

const presets: MockAudioPreset[] = [
  {
    duration: '0:04',
    frequencies: [174, 261.63, 392],
    groove: 'slow',
    seconds: 4,
  },
  {
    duration: '0:03',
    frequencies: [220, 440, 660],
    groove: 'steady',
    seconds: 3,
  },
  {
    duration: '0:03',
    frequencies: [110, 220, 329.63],
    groove: 'pulse',
    seconds: 3,
  },
  {
    duration: '0:05',
    frequencies: [196, 293.66, 523.25],
    groove: 'spark',
    seconds: 5,
  },
];

function hashInput(input: GenerateTrackInput) {
  const value = `${input.prompt}|${input.genre}|${input.mood}`.toLowerCase();

  return [...value].reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

function selectPreset(input: GenerateTrackInput) {
  const combinedInput = `${input.prompt} ${input.genre} ${input.mood}`.toLowerCase();

  if (combinedInput.includes('hip-hop') || combinedInput.includes('beat')) {
    return presets[2];
  }

  if (combinedInput.includes('cinematic') || combinedInput.includes('melancholic')) {
    return presets[3];
  }

  if (combinedInput.includes('pop') || combinedInput.includes('energetic')) {
    return presets[1];
  }

  if (combinedInput.includes('ambient') || combinedInput.includes('dreamy')) {
    return presets[0];
  }

  return presets[hashInput(input) % presets.length];
}

function getGrooveLevel(groove: MockAudioPreset['groove'], time: number) {
  if (groove === 'slow') {
    return 0.75 + Math.sin(2 * Math.PI * 0.5 * time) * 0.25;
  }

  if (groove === 'pulse') {
    return Math.sin(2 * Math.PI * 3 * time) > 0.35 ? 1 : 0.28;
  }

  if (groove === 'spark') {
    return 0.55 + Math.abs(Math.sin(2 * Math.PI * 4.5 * time)) * 0.45;
  }

  return 0.7 + Math.sin(2 * Math.PI * 2 * time) * 0.3;
}

function createMockAudioUrl(preset: MockAudioPreset, seed: number) {
  const sampleRate = 22050;
  const seconds = preset.seconds;
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
    const grooveLevel = getGrooveLevel(preset.groove, time);
    const detune = (seed % 9) - 4;
    const tone =
      Math.sin(2 * Math.PI * (preset.frequencies[0] + detune) * time) * 0.36 +
      Math.sin(2 * Math.PI * preset.frequencies[1] * time) * 0.24 +
      Math.sin(2 * Math.PI * preset.frequencies[2] * time) * 0.14;
    const sample = tone * envelope * grooveLevel;

    view.setInt16(
      headerSize + index * bytesPerSample,
      sample * 0x7fff,
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

        const seed = hashInput(input);
        const preset = selectPreset(input);

        resolve({
          title: createTitle(input),
          duration: preset.duration,
          audioUrl: createMockAudioUrl(preset, seed),
          genre: input.genre,
          mood: input.mood,
        });
      }, 1500);
    });
  },
};
