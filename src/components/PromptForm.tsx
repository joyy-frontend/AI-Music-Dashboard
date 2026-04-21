import { FormEvent, useEffect, useState } from 'react';
import type { GenerateTrackInput } from '../types/music';

export type GenerationRequest = GenerateTrackInput;

type PromptFormProps = {
  isGenerating: boolean;
  loadingLabel?: string;
  onDraftChange?: (request: GenerationRequest) => void;
  onGenerate: (request: GenerationRequest) => void;
};

const genres = ['Ambient', 'Pop', 'Hip-Hop', 'Cinematic', 'Electronic'];
const moods = ['Dreamy', 'Energetic', 'Melancholic', 'Focused', 'Uplifting'];
const promptPresets: Array<GenerateTrackInput & { label: string }> = [
  {
    label: 'Ambient piano',
    prompt: 'Soft ambient piano with airy pads and slow evolving textures',
    genre: 'Ambient',
    mood: 'Dreamy',
  },
  {
    label: 'Cinematic tension',
    prompt: 'Dark cinematic tension with low strings, pulses, and distant hits',
    genre: 'Cinematic',
    mood: 'Melancholic',
  },
  {
    label: 'Lo-fi study beat',
    prompt: 'Dusty lo-fi study beat with mellow chords and relaxed drums',
    genre: 'Hip-Hop',
    mood: 'Focused',
  },
  {
    label: 'Dreamy synth',
    prompt: 'Dreamy synthwave loop with warm arpeggios and floating leads',
    genre: 'Electronic',
    mood: 'Uplifting',
  },
];

export default function PromptForm({
  isGenerating,
  loadingLabel,
  onDraftChange,
  onGenerate,
}: PromptFormProps) {
  const [prompt, setPrompt] = useState(
    'Warm synth textures with a clean vocal hook and subtle percussion',
  );
  const [genre, setGenre] = useState(genres[0]);
  const [mood, setMood] = useState(moods[0]);

  useEffect(() => {
    onDraftChange?.({ prompt, genre, mood });
  }, [genre, mood, onDraftChange, prompt]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onGenerate({ prompt, genre, mood });
  };

  const handlePresetSelect = (preset: GenerateTrackInput) => {
    setPrompt(preset.prompt);
    setGenre(preset.genre);
    setMood(preset.mood);
  };

  const isSelectedPreset = (preset: GenerateTrackInput) => {
    return (
      prompt === preset.prompt && genre === preset.genre && mood === preset.mood
    );
  };

  return (
    <form className="panel prompt-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <p className="eyebrow">Prompt</p>
        <h2>Create a track</h2>
      </div>

      <label htmlFor="prompt">Music prompt</label>
      <div className="preset-list" aria-label="Prompt presets">
        {promptPresets.map((preset) => (
          <button
            key={preset.label}
            className={`preset-button ${
              isSelectedPreset(preset) ? 'is-selected' : ''
            }`}
            type="button"
            aria-pressed={isSelectedPreset(preset)}
            disabled={isGenerating}
            onClick={() => handlePresetSelect(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <textarea
        id="prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Describe the sound, instruments, tempo, and vibe..."
        rows={7}
        disabled={isGenerating}
      />

      <div className="select-grid">
        <div>
          <label htmlFor="genre">Genre</label>
          <select
            id="genre"
            value={genre}
            disabled={isGenerating}
            onChange={(event) => setGenre(event.target.value)}
          >
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mood">Mood</label>
          <select
            id="mood"
            value={mood}
            disabled={isGenerating}
            onChange={(event) => setMood(event.target.value)}
          >
            {moods.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>
      {isGenerating ? (
        <p className="form-status" aria-live="polite">
          {loadingLabel ?? 'Generating audio preview...'}
        </p>
      ) : null}
    </form>
  );
}
