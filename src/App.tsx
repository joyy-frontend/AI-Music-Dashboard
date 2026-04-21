import { useState } from 'react';
import PromptForm, { GenerationRequest } from './components/PromptForm';
import TrackResult, { Track } from './components/TrackResult';

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

const silentAudio =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQQAAAAAAA==';

function createMockTrack(request: GenerationRequest): Promise<Track> {
  const promptSeed = request.prompt
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join(' ');

  const titleBase = promptSeed || `${request.mood} ${request.genre}`;

  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (request.prompt.toLowerCase().includes('error')) {
        reject(new Error('Mock generation failed. Please try another prompt.'));
        return;
      }

      resolve({
        title: `${titleBase} Sketch`,
        duration: '2:48',
        audioUrl: silentAudio,
        genre: request.genre,
        mood: request.mood,
      });
    }, 1500);
  });
}

export default function App() {
  const [track, setTrack] = useState<Track | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (request: GenerationRequest) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const generatedTrack = await createMockTrack(request);
      setTrack(generatedTrack);
      setStatus('success');
    } catch (error) {
      setTrack(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while generating the track.',
      );
      setStatus('error');
    }
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">AI Music Studio</p>
        <h1>AI Music Generation Dashboard</h1>
        <p className="intro">
          Turn a short creative prompt into a polished mock track preview for a
          portfolio-ready music generation workflow.
        </p>
      </section>

      <section className="dashboard" aria-label="Music generation dashboard">
        <PromptForm
          onGenerate={handleGenerate}
          isGenerating={status === 'loading'}
        />
        <TrackResult
          track={track}
          status={status}
          errorMessage={errorMessage}
        />
      </section>
    </main>
  );
}
