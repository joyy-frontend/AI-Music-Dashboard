type WaveformPreviewProps = {
  isLoading?: boolean;
};

const bars = [34, 58, 42, 76, 51, 88, 63, 47, 72, 56, 91, 68, 39, 62, 80, 45];

export default function WaveformPreview({ isLoading }: WaveformPreviewProps) {
  return (
    <div
      className={`waveform ${isLoading ? 'is-loading' : ''}`}
      aria-label="Waveform preview"
    >
      {bars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          style={{ height: `${height}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
