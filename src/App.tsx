import { useState } from 'react';
import { generateTrack } from './api/musicApi';
import PromptForm, { GenerationRequest } from './components/PromptForm';
import TrackResult, { Track } from './components/TrackResult';
import type { GenerationStatus } from './types/music';

export default function App() {
  const [track, setTrack] = useState<Track | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (request: GenerationRequest) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const generatedTrack = await generateTrack(request);
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
