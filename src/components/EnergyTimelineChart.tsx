import { useEffect, useMemo, useRef } from 'react';
import { init } from '../lib/echarts';
import type { AudioAnalysisSample } from '../types/music';

type EnergyTimelineChartProps = {
  samples: AudioAnalysisSample[];
};

const maxVisiblePoints = 32;

function formatAxisTime(value: string | number) {
  const seconds = Number(value);

  if (!Number.isFinite(seconds)) {
    return '0.0s';
  }

  return `${seconds.toFixed(1)}s`;
}

export default function EnergyTimelineChart({
  samples,
}: EnergyTimelineChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const visibleSamples = useMemo(() => {
    return samples.slice(-maxVisiblePoints);
  }, [samples]);

  useEffect(() => {
    if (!chartRef.current || visibleSamples.length === 0) {
      return undefined;
    }

    const chart = init(chartRef.current);
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(chartRef.current);
    chart.setOption({
      color: ['#2d6cdf', '#24b8a6'],
      grid: {
        bottom: 54,
        containLabel: true,
        left: 12,
        right: 18,
        top: 28,
      },
      legend: {
        bottom: 6,
        data: ['Energy', 'Intensity'],
        icon: 'roundRect',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
        },
        formatter: (params: unknown) => {
          const items = params as Array<{
            marker: string;
            seriesName: string;
            value: number;
            dataIndex: number;
          }>;
          const sample = visibleSamples[items[0]?.dataIndex ?? 0];

          if (!sample) {
            return 'No analysis data';
          }

          const rows = items.map((item) => {
            const value = Number.isFinite(Number(item.value))
              ? Number(item.value)
              : 0;

            return `${item.marker}${item.seriesName}: <strong>${value}%</strong>`;
          });

          return [`Time ${formatAxisTime(sample.time)}`, ...rows].join('<br/>');
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: visibleSamples.map((sample) => sample.time),
        axisLabel: {
          formatter: (value: string | number) => formatAxisTime(value),
          hideOverlap: true,
          interval: Math.max(0, Math.ceil(visibleSamples.length / 6) - 1),
          margin: 12,
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          margin: 10,
        },
        splitLine: {
          lineStyle: {
            color: '#e8eef6',
          },
        },
      },
      series: [
        {
          name: 'Energy',
          type: 'line',
          smooth: true,
          symbol: 'none',
          showSymbol: false,
          lineStyle: {
            width: 3,
          },
          data: visibleSamples.map((sample) => sample.averageEnergy),
        },
        {
          name: 'Intensity',
          type: 'line',
          smooth: true,
          symbol: 'none',
          showSymbol: false,
          lineStyle: {
            width: 3,
          },
          data: visibleSamples.map((sample) => sample.intensity),
        },
      ],
    });

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [visibleSamples]);

  return (
    <section className="panel chart-card">
      <div className="chart-heading">
        <div>
          <p className="eyebrow">Live signal</p>
          <h2>Energy / intensity over time</h2>
        </div>
      </div>

      {visibleSamples.length > 0 ? (
        <div ref={chartRef} className="chart-surface" />
      ) : (
        <div className="chart-empty">
          Generate and play a track to collect live energy and intensity data.
        </div>
      )}
    </section>
  );
}
