import { useCallback, useState } from 'react';
import { generateTrack } from './api/musicApi';
import DashboardVisuals from './components/DashboardVisuals';
import GenerationHistoryList from './components/GenerationHistoryList';
import PromptForm, { GenerationRequest } from './components/PromptForm';
import TrackResult, { Track } from './components/TrackResult';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import type {
  AudioAnalysisSample,
  GenerationKind,
  GenerationHistoryItem,
  GenerationStatus,
} from './types/music';

const initialGenerationRequest: GenerationRequest = {
  prompt: 'Warm synth textures with a clean vocal hook and subtle percussion',
  genre: 'Ambient',
  mood: 'Dreamy',
};

type PendingGeneration = {
  generationType: GenerationKind;
  parent?: GenerationHistoryItem | Track | null;
  request: GenerationRequest;
};

function getLoadingLabel(generationType: GenerationKind | null) {
  if (generationType === 'regenerated') {
    return 'Regenerating with the same prompt...';
  }

  if (generationType === 'variation') {
    return 'Creating a variation from the selected result...';
  }

  return 'Generating a new 30-second track...';
}

export default function App() {
  const [track, setTrack] = useState<Track | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentRequest, setCurrentRequest] = useState<GenerationRequest>(
    initialGenerationRequest,
  );
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingGenerationType, setPendingGenerationType] =
    useState<GenerationKind | null>(null);
  const [lastFailedGeneration, setLastFailedGeneration] =
    useState<PendingGeneration | null>(null);
  const [analysisSamples, setAnalysisSamples] = useState<AudioAnalysisSample[]>(
    [],
  );
  const [generationHistory, setGenerationHistory] = useLocalStorageState<
    GenerationHistoryItem[]
  >('ai-music-generation-history', []);

  const runGeneration = async (
    request: GenerationRequest,
    generationType: GenerationKind,
    parent?: GenerationHistoryItem | Track | null,
  ) => {
    const pendingGeneration = { generationType, parent, request };

    setStatus('loading');
    setErrorMessage(null);
    setAnalysisSamples([]);
    setCurrentRequest(request);
    setPendingGenerationType(generationType);

    try {
      const generatedTrack = await generateTrack(request);
      const id = `${Date.now()}-${generationHistory.length}`;
      const historyItem: GenerationHistoryItem = {
        ...generatedTrack,
        id,
        createdAt: new Date().toISOString(),
        generationType,
        parentId:
          parent && 'id' in parent && typeof parent.id === 'string'
            ? parent.id
            : currentTrackId ?? undefined,
        parentTitle: parent?.title,
        prompt: request.prompt,
      };

      setTrack(historyItem);
      setCurrentTrackId(id);
      setGenerationHistory((currentHistory) => [
        historyItem,
        ...currentHistory,
      ].slice(0, 6));
      setLastFailedGeneration(null);
      setStatus('success');
    } catch (error) {
      setTrack(null);
      setLastFailedGeneration(pendingGeneration);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while generating the track.',
      );
      setStatus('error');
    } finally {
      setPendingGenerationType(null);
    }
  };

  const handleGenerate = async (request: GenerationRequest) => {
    await runGeneration(request, 'original');
  };

  const handleRegenerate = async () => {
    await runGeneration(currentRequest, 'regenerated', track);
  };

  const handleGenerateVariation = async () => {
    if (!track) {
      return;
    }

    await runGeneration(
      {
        ...currentRequest,
        prompt: `Variation of ${track.title}: ${currentRequest.prompt}. Alternate arrangement with a different groove and melodic contour.`,
      },
      'variation',
      track,
    );
  };

  const handleRetry = async () => {
    if (!lastFailedGeneration) {
      await runGeneration(currentRequest, 'original');
      return;
    }

    await runGeneration(
      lastFailedGeneration.request,
      lastFailedGeneration.generationType,
      lastFailedGeneration.parent,
    );
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

  const handleSelectHistoryTrack = (historyTrack: GenerationHistoryItem) => {
    setTrack(historyTrack);
    setCurrentTrackId(historyTrack.id);
    setCurrentRequest({
      prompt: historyTrack.prompt,
      genre: historyTrack.genre,
      mood: historyTrack.mood,
    });
    setAnalysisSamples([]);
    setErrorMessage(null);
    setStatus('success');
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">AI Music Studio</p>
        <h1>AI Music Generation Dashboard</h1>
        <p className="intro">
          Turn a short creative prompt into a polished 30-second AI music
          preview with playback, waveform, and live analysis.
        </p>
      </section>

      <section className="dashboard" aria-label="Music generation dashboard">
        <PromptForm
          onDraftChange={setCurrentRequest}
          onGenerate={handleGenerate}
          isGenerating={status === 'loading'}
          loadingLabel={getLoadingLabel(pendingGenerationType)}
        />
        <TrackResult
          track={track}
          status={status}
          errorMessage={errorMessage}
          isGenerating={status === 'loading'}
          loadingLabel={getLoadingLabel(pendingGenerationType)}
          onAnalysisSample={handleAnalysisSample}
          onGenerateVariation={track ? handleGenerateVariation : undefined}
          onRegenerate={handleRegenerate}
          onRetry={handleRetry}
        />
      </section>

      <GenerationHistoryList
        history={generationHistory}
        selectedTrackId={currentTrackId}
        onSelectTrack={handleSelectHistoryTrack}
      />

      <DashboardVisuals
        analysisSamples={analysisSamples}
        generationHistory={generationHistory}
      />
    </main>
  );
}
