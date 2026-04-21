import { useEffect, useRef } from 'react';
import { init } from '../lib/echarts';
import type { GenerationHistoryItem } from '../types/music';

type GenerationHistoryChartProps = {
  history: GenerationHistoryItem[];
};

function parseDuration(duration: string) {
  const [minutes = '0', seconds = '0'] = duration.split(':');

  return Number(minutes) * 60 + Number(seconds);
}

export default function GenerationHistoryChart({
  history,
}: GenerationHistoryChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current || history.length === 0) {
      return undefined;
    }

    const chart = init(chartRef.current);
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(chartRef.current);
    chart.setOption({
      color: ['#111827'],
      grid: {
        bottom: 36,
        left: 36,
        right: 14,
        top: 18,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const [item] = params as Array<{ dataIndex: number; value: number }>;
          if (!item) {
            return 'No generation data';
          }

          const track = history[item.dataIndex];
          if (!track) {
            return 'No generation data';
          }

          return `${track.title}<br/>${track.genre} / ${track.mood}<br/>${item.value}s`;
        },
      },
      xAxis: {
        type: 'category',
        data: history.map((track) => track.genre),
        axisLabel: {
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        name: 'sec',
      },
      series: [
        {
          name: 'Duration',
          type: 'bar',
          barMaxWidth: 36,
          data: history.map((track) => ({
            value: parseDuration(track.duration),
            itemStyle: {
              color: track.mood === 'Energetic' ? '#24b8a6' : '#2d6cdf',
            },
          })),
        },
      ],
    });

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [history]);

  return (
    <section className="panel chart-card">
      <div className="chart-heading">
        <div>
          <p className="eyebrow">Generation history</p>
          <h2>Recent metadata comparison</h2>
        </div>
      </div>

      {history.length > 0 ? (
        <div ref={chartRef} className="chart-surface" />
      ) : (
        <div className="chart-empty">
          Metadata comparison appears after your first successful generation.
        </div>
      )}
    </section>
  );
}
