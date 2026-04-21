export type GenerateTrackInput = {
  prompt: string;
  genre: string;
  mood: string;
};

export type GeneratedTrack = {
  title: string;
  duration: string;
  audioUrl: string;
  genre: string;
  mood: string;
};

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export type AudioAnalysisSample = {
  time: number;
  averageEnergy: number;
  peakLevel: number;
  intensity: number;
};

export type GenerationKind = 'original' | 'regenerated' | 'variation';

export type GenerationHistoryItem = GeneratedTrack & {
  id: string;
  createdAt: string;
  generationType: GenerationKind;
  parentId?: string;
  parentTitle?: string;
  prompt: string;
};
