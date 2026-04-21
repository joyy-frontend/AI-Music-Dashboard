import WaveformPreview from './WaveformPreview';
import type { GeneratedTrack, GenerationStatus } from '../types/music';

export type Track = GeneratedTrack;

type TrackResultProps = {
  status: GenerationStatus;
  errorMessage: string | null;
  track: Track | null;
};

export default function TrackResult({
  errorMessage,
  status,
  track,
}: TrackResultProps) {
  if (status === 'loading') {
    return (
      <section className="panel result-panel" aria-live="polite">
        <p className="eyebrow">Result</p>
        <h2>Composing preview...</h2>
        <WaveformPreview isLoading />
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="panel result-panel error-state" aria-live="polite">
        <p className="eyebrow">Error</p>
        <h2>Generation failed</h2>
        <p>{errorMessage}</p>
        <WaveformPreview />
      </section>
    );
  }

  if (!track) {
    return (
      <section className="panel result-panel empty-state">
        <p className="eyebrow">Result</p>
        <h2>Your generated track will appear here.</h2>
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

      <WaveformPreview audioUrl={track.audioUrl} />
    </section>
  );
}
