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
