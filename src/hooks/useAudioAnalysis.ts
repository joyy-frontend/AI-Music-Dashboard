import { useEffect, useRef, useState } from 'react';

export type AudioAnalysisMetrics = {
  averageEnergy: number;
  peakLevel: number;
  intensity: number;
};

type AudioAnalysisStatus = 'idle' | 'analyzing' | 'unavailable' | 'error';

type AudioAnalysisResult = {
  metrics: AudioAnalysisMetrics;
  status: AudioAnalysisStatus;
};

const emptyMetrics: AudioAnalysisMetrics = {
  averageEnergy: 0,
  peakLevel: 0,
  intensity: 0,
};

type WebAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function getAudioContextConstructor() {
  return (
    window.AudioContext ??
    (window as WebAudioWindow).webkitAudioContext ??
    null
  );
}

function toPercent(value: number) {
  return Math.round(Math.min(Math.max(value, 0), 1) * 100);
}

export function useAudioAnalysis(
  mediaElement: HTMLMediaElement | null,
  isPlaying: boolean,
): AudioAnalysisResult {
  const [metrics, setMetrics] = useState<AudioAnalysisMetrics>(emptyMetrics);
  const [status, setStatus] = useState<AudioAnalysisStatus>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    setMetrics(emptyMetrics);
    setStatus(mediaElement ? 'idle' : 'unavailable');

    if (!mediaElement) {
      return undefined;
    }

    const AudioContextConstructor = getAudioContextConstructor();

    if (!AudioContextConstructor) {
      setStatus('unavailable');
      return undefined;
    }

    try {
      const audioContext = new AudioContextConstructor();
      const source = audioContext.createMediaElementSource(mediaElement);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.fftSize);

      return () => {
        if (frameRef.current) {
          window.clearTimeout(frameRef.current);
          frameRef.current = null;
        }

        source.disconnect();
        analyser.disconnect();
        void audioContext.close();
        audioContextRef.current = null;
        analyserRef.current = null;
        dataRef.current = null;
      };
    } catch {
      setStatus('error');
      return undefined;
    }
  }, [mediaElement]);

  useEffect(() => {
    if (frameRef.current) {
      window.clearTimeout(frameRef.current);
      frameRef.current = null;
    }

    const audioContext = audioContextRef.current;
    const analyser = analyserRef.current;
    const data = dataRef.current;

    if (!mediaElement || !audioContext || !analyser || !data) {
      return undefined;
    }

    if (!isPlaying) {
      setStatus('idle');
      return undefined;
    }

    const updateMetrics = () => {
      analyser.getByteTimeDomainData(data);

      let squaredTotal = 0;
      let peak = 0;

      for (const sample of data) {
        const centeredSample = (sample - 128) / 128;
        const absoluteSample = Math.abs(centeredSample);

        squaredTotal += centeredSample * centeredSample;
        peak = Math.max(peak, absoluteSample);
      }

      const averageEnergy = Math.sqrt(squaredTotal / data.length);

      setMetrics({
        averageEnergy: toPercent(averageEnergy),
        peakLevel: toPercent(peak),
        intensity: toPercent(averageEnergy * 0.7 + peak * 0.3),
      });

      frameRef.current = window.setTimeout(updateMetrics, 120);
    };

    setStatus('analyzing');
    void audioContext.resume();
    updateMetrics();

    return () => {
      if (frameRef.current) {
        window.clearTimeout(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [mediaElement, isPlaying]);

  return { metrics, status };
}
