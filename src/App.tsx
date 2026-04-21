import { useCallback, useState } from 'react';
import { generateTrack } from './api/musicApi';
import DashboardVisuals from './components/DashboardVisuals';
import PromptForm, { GenerationRequest } from './components/PromptForm';
import TrackResult, { Track } from './components/TrackResult';
import type {
  AudioAnalysisSample,
  GenerationHistoryItem,
  GenerationStatus,
} from './types/music';

export default function App() {
  const [track, setTrack] = useState<Track | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisSamples, setAnalysisSamples] = useState<AudioAnalysisSample[]>(
    [],
  );
  const [generationHistory, setGenerationHistory] = useState<
    GenerationHistoryItem[]
  >([]);

  const handleGenerate = async (request: GenerationRequest) => {
    setStatus('loading');
    setErrorMessage(null);
    setAnalysisSamples([]);

    try {
      const generatedTrack = await generateTrack(request);
      setTrack(generatedTrack);
      setGenerationHistory((currentHistory) => [
        {
          ...generatedTrack,
          id: `${Date.now()}-${currentHistory.length}`,
          createdAt: new Date().toISOString(),
        },
        ...currentHistory,
      ].slice(0, 6));
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

  const handleAnalysisSample = useCallback((sample: AudioAnalysisSample) => {
    const normalizedSample = {
      ...sample,
      time: Math.round(sample.time * 10) / 10,
    };

    setAnalysisSamples((currentSamples) => {
      const previousSample = currentSamples.at(-1);

      if (previousSample?.time === normalizedSample.time) {
        return [...currentSamples.slice(0, -1), normalizedSample];
      }

      return [...currentSamples, normalizedSample].slice(-48);
    });
  }, []);

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
          onAnalysisSample={handleAnalysisSample}
        />
      </section>

      <DashboardVisuals
        analysisSamples={analysisSamples}
        generationHistory={generationHistory}
      />
    </main>
  );
}
