import type { GenerationHistoryItem } from '../types/music';

type GenerationHistoryListProps = {
  selectedTrackId?: string | null;
  history: GenerationHistoryItem[];
  onSelectTrack: (track: GenerationHistoryItem) => void;
};

function formatCreatedTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatGenerationType(track: GenerationHistoryItem) {
  return track.generationType ?? 'original';
}

export default function GenerationHistoryList({
  history,
  onSelectTrack,
  selectedTrackId,
}: GenerationHistoryListProps) {
  return (
    <section className="panel history-panel">
      <div className="panel-heading">
        <p className="eyebrow">History</p>
        <h2>Recent generations</h2>
      </div>

      {history.length > 0 ? (
        <div className="history-list">
          {history.map((track) => (
            <button
              key={track.id}
              className={`history-item ${
                track.id === selectedTrackId ? 'is-selected' : ''
              }`}
              type="button"
              aria-pressed={track.id === selectedTrackId}
              onClick={() => onSelectTrack(track)}
            >
              <span className="history-title">{track.title}</span>
              <span className="history-badge">
                {formatGenerationType(track)}
              </span>
              <span className="history-prompt">{track.prompt}</span>
              <span className="history-meta">
                {track.genre} / {track.mood} / {track.duration} /{' '}
                {formatCreatedTime(track.createdAt)}
              </span>
              {track.parentTitle ? (
                <span className="history-parent">
                  Derived from {track.parentTitle}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <p className="history-empty">
          No generations yet. Create a track to build a saved history you can
          revisit after refresh.
        </p>
      )}
    </section>
  );
}
