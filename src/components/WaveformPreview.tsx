import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

type WaveformPreviewProps = {
  audioUrl?: string;
  isLoading?: boolean;
};

export default function WaveformPreview({
  audioUrl,
  isLoading = false,
}: WaveformPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioUrl || !containerRef.current) {
      return undefined;
    }

    setIsReady(false);
    setIsPlaying(false);

    const waveSurfer = WaveSurfer.create({
      barGap: 3,
      barRadius: 3,
      barWidth: 4,
      container: containerRef.current,
      cursorColor: '#111827',
      height: 96,
      progressColor: '#24b8a6',
      url: audioUrl,
      waveColor: '#2d6cdf',
    });

    waveSurferRef.current = waveSurfer;

    waveSurfer.on('ready', () => {
      setIsReady(true);
    });
    waveSurfer.on('play', () => {
      setIsPlaying(true);
    });
    waveSurfer.on('pause', () => {
      setIsPlaying(false);
    });
    waveSurfer.on('finish', () => {
      setIsPlaying(false);
      waveSurfer.seekTo(0);
    });

    return () => {
      waveSurfer.destroy();
      waveSurferRef.current = null;
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    waveSurferRef.current?.playPause();
  };

  const showPlayer = Boolean(audioUrl);

  return (
    <div className="waveform-player">
      <div
        className={`waveform ${isLoading ? 'is-loading' : ''}`}
        aria-label="Waveform preview"
      >
        {showPlayer ? (
          <div ref={containerRef} className="waveform-canvas" />
        ) : (
          <div className="waveform-empty" aria-hidden="true" />
        )}
      </div>

      {showPlayer ? (
        <button
          className="playback-button"
          type="button"
          onClick={handlePlayPause}
          disabled={!isReady}
          aria-label={isPlaying ? 'Pause track' : 'Play track'}
        >
          <span aria-hidden="true">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
      ) : null}
    </div>
  );
}
