import type {
  AudioAnalysisSample,
  GenerationHistoryItem,
} from '../types/music';
import EnergyTimelineChart from './EnergyTimelineChart';
import GenerationHistoryChart from './GenerationHistoryChart';

type DashboardVisualsProps = {
  analysisSamples: AudioAnalysisSample[];
  generationHistory: GenerationHistoryItem[];
};

export default function DashboardVisuals({
  analysisSamples,
  generationHistory,
}: DashboardVisualsProps) {
  return (
    <section className="visual-dashboard" aria-label="Music analytics dashboard">
      <EnergyTimelineChart samples={analysisSamples} />
      <GenerationHistoryChart history={generationHistory} />
    </section>
  );
}
