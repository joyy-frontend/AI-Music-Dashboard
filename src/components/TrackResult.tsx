import WaveformPreview from './WaveformPreview';
import type {
  AudioAnalysisSample,
  GeneratedTrack,
  GenerationStatus,
} from '../types/music';

export type Track = GeneratedTrack;

type TrackResultProps = {
  status: GenerationStatus;
  errorMessage: string | null;
  isGenerating?: boolean;
  loadingLabel?: string;
  onAnalysisSample?: (sample: AudioAnalysisSample) => void;
  onGenerateVariation?: () => void;
  onRegenerate?: () => void;
  onRetry?: () => void;
  track: Track | null;
};

export default function TrackResult({
  errorMessage,
  isGenerating = false,
  loadingLabel,
  onAnalysisSample,
  onGenerateVariation,
  onRegenerate,
  onRetry,
  status,
  track,
}: TrackResultProps) {
  if (status === 'loading') {
    return (
      <section className="panel result-panel" aria-live="polite">
        <p className="eyebrow">Result</p>
        <h2>Composing preview...</h2>
        <div className="status-row">
          <span className="loading-spinner" aria-hidden="true" />
          <p>{loadingLabel ?? 'Preparing a generated audio result...'}</p>
        </div>
        <WaveformPreview isLoading />
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="panel result-panel error-state" aria-live="polite">
        <p className="eyebrow">Error</p>
        <h2>Generation failed</h2>
        <p>
          {errorMessage ??
            'The API could not return a generated track. Check the local server and try again.'}
        </p>
        <button
          className="secondary-action retry-action"
          type="button"
          onClick={onRetry}
          disabled={!onRetry}
        >
          Retry generation
        </button>
        <WaveformPreview />
      </section>
    );
  }

  if (!track) {
    return (
      <section className="panel result-panel empty-state">
        <p className="eyebrow">Result</p>
        <h2>No track generated yet</h2>
        <p>
          Choose a preset or write a prompt, then generate a track to unlock
          playback, waveform analysis, and dashboard charts.
        </p>
        <WaveformPreview />
      </section>
    );
  }

  return (
    <section className="panel result-panel" aria-live="polite">
      <p className="eyebrow">Generated track</p>
      <div className="track-header">
        <div>
          <h2>{track.title}</h2>
          <p>
            {track.genre} / {track.mood}
          </p>
        </div>
        <span>{track.duration}</span>
      </div>

      <div className="track-actions" aria-label="Generation actions">
        <button
          className="secondary-action"
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating || !onRegenerate}
        >
          Regenerate
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={onGenerateVariation}
          disabled={isGenerating || !onGenerateVariation || !track}
        >
          Generate variation
        </button>
      </div>

      <WaveformPreview
        audioUrl={track.audioUrl}
        onAnalysisSample={onAnalysisSample}
      />
    </section>
  );
}
