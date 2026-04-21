import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAudioAnalysis } from '../hooks/useAudioAnalysis';
import type { AudioAnalysisSample } from '../types/music';

type WaveformPreviewProps = {
  audioUrl?: string;
  isLoading?: boolean;
  onAnalysisSample?: (sample: AudioAnalysisSample) => void;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}

function getAnalysisStatusMessage(status: string) {
  if (status === 'analyzing') {
    return 'Reading the live playback signal.';
  }

  if (status === 'error') {
    return 'Audio analysis is unavailable for this source.';
  }

  if (status === 'unavailable') {
    return 'Play a generated track to enable analysis.';
  }

  return 'Analysis updates while audio is playing.';
}

export default function WaveformPreview({
  audioUrl,
  isLoading = false,
  onAnalysisSample,
}: WaveformPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mediaElement, setMediaElement] = useState<HTMLMediaElement | null>(
    null,
  );
  const { metrics, status: analysisStatus } = useAudioAnalysis(
    mediaElement,
    isPlaying,
  );

  useEffect(() => {
    if (analysisStatus !== 'analyzing') {
      return;
    }

    onAnalysisSample?.({
      time: waveSurferRef.current?.getCurrentTime() ?? currentTime,
      averageEnergy: metrics.averageEnergy,
      peakLevel: metrics.peakLevel,
      intensity: metrics.intensity,
    });
  }, [analysisStatus, currentTime, metrics, onAnalysisSample]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsReady(false);
    setIsPlaying(false);
    setLoadError(null);
    setMediaElement(null);

    if (!audioUrl || !containerRef.current) {
      return undefined;
    }

    const waveSurfer = WaveSurfer.create({
      barGap: 3,
      barRadius: 3,
      barWidth: 4,
      container: containerRef.current,
      cursorColor: '#111827',
      dragToSeek: true,
      height: 96,
      normalize: true,
      progressColor: '#24b8a6',
      url: audioUrl,
      waveColor: '#2d6cdf',
    });

    waveSurferRef.current = waveSurfer;

    waveSurfer.on('ready', (loadedDuration) => {
      setDuration(loadedDuration || waveSurfer.getDuration());
      setMediaElement(waveSurfer.getMediaElement());
      setIsReady(true);
    });
    waveSurfer.on('play', () => {
      setIsPlaying(true);
    });
    waveSurfer.on('pause', () => {
      setIsPlaying(false);
    });
    waveSurfer.on('timeupdate', (time) => {
      setCurrentTime(time);
    });
    waveSurfer.on('seeking', (time) => {
      setCurrentTime(time);
    });
    waveSurfer.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      waveSurfer.seekTo(0);
    });
    waveSurfer.on('error', () => {
      setLoadError('Audio could not be loaded.');
      setIsReady(false);
      setIsPlaying(false);
      setMediaElement(null);
    });

    return () => {
      waveSurfer.destroy();
      waveSurferRef.current = null;
      setMediaElement(null);
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    waveSurferRef.current?.playPause();
  };

  const showPlayer = Boolean(audioUrl);
  const playerStatus = loadError
    ? 'unavailable'
    : isLoading
      ? 'loading'
      : showPlayer
        ? 'ready'
        : 'empty';

  return (
    <div
      className={`waveform-player ${isPlaying ? 'is-playing' : ''}`}
      data-status={playerStatus}
    >
      <div
        className={`waveform ${isLoading ? 'is-loading' : ''} ${
          loadError ? 'has-error' : ''
        }`}
        aria-label="Waveform preview"
      >
        {showPlayer && !loadError ? (
          <div ref={containerRef} className="waveform-canvas" />
        ) : (
          <div className="waveform-empty" aria-hidden="true" />
        )}
      </div>

      {showPlayer ? (
        <>
          <div className="playback-controls">
            <button
              className="playback-button"
              type="button"
              onClick={handlePlayPause}
              disabled={!isReady || Boolean(loadError)}
              aria-label={isPlaying ? 'Pause track' : 'Play track'}
            >
              <span aria-hidden="true">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <div className="playback-meta" aria-live="polite">
              {loadError ? (
                <span>{loadError}</span>
              ) : (
                <span>
                  {isReady ? formatTime(currentTime) : 'Loading'} /{' '}
                  {isReady ? formatTime(duration) : '--:--'}
                </span>
              )}
            </div>
          </div>

          <div className="analysis-panel" aria-live="polite">
            <div className="analysis-header">
              <p className="eyebrow">Audio analysis</p>
              <span>{analysisStatus}</span>
            </div>
            <p className="analysis-status-message">
              {getAnalysisStatusMessage(analysisStatus)}
            </p>
            <div className="analysis-grid">
              <div className="analysis-metric">
                <strong>{metrics.averageEnergy}%</strong>
                <span>Average energy</span>
                <p>Overall loudness across the current audio frame.</p>
              </div>
              <div className="analysis-metric">
                <strong>{metrics.peakLevel}%</strong>
                <span>Peak level</span>
                <p>Highest momentary amplitude detected right now.</p>
              </div>
              <div className="analysis-metric">
                <strong>{metrics.intensity}%</strong>
                <span>Intensity</span>
                <p>Combined energy and peak signal for perceived drive.</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="waveform-status">
          {isLoading
            ? 'Preparing waveform and playback controls...'
            : 'No audio loaded yet. Generate a track to preview playback.'}
        </p>
      )}
    </div>
  );
}
