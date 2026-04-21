import { FormEvent, useState } from 'react';

export type GenerationRequest = {
  prompt: string;
  genre: string;
  mood: string;
};

type PromptFormProps = {
  isGenerating: boolean;
  onGenerate: (request: GenerationRequest) => void;
};

const genres = ['Ambient', 'Pop', 'Hip-Hop', 'Cinematic', 'Electronic'];
const moods = ['Dreamy', 'Energetic', 'Melancholic', 'Focused', 'Uplifting'];

export default function PromptForm({
  isGenerating,
  onGenerate,
}: PromptFormProps) {
  const [prompt, setPrompt] = useState(
    'Warm synth textures with a clean vocal hook and subtle percussion',
  );
  const [genre, setGenre] = useState(genres[0]);
  const [mood, setMood] = useState(moods[0]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onGenerate({ prompt, genre, mood });
  };

  return (
    <form className="panel prompt-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <p className="eyebrow">Prompt</p>
        <h2>Create a track</h2>
      </div>

      <label htmlFor="prompt">Music prompt</label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Describe the sound, instruments, tempo, and vibe..."
        rows={7}
      />

      <div className="select-grid">
        <div>
          <label htmlFor="genre">Genre</label>
          <select
            id="genre"
            value={genre}
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
    </form>
  );
}
