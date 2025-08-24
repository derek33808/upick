import React from 'react';

interface PriceHistoryChartProps {
  prices: number[];
  width?: number;
  height?: number;
  color?: string; // stroke color
  // Optional: date of the last data point; we derive previous dates backwards by day
  endDate?: Date;
}

// Simple area line chart with axes and annotations. No external deps.
export function PriceHistoryChart({
  prices,
  width = 640,
  height = 160,
  color = '#2563eb', // tailwind blue-600
  endDate = new Date()
}: PriceHistoryChartProps) {
  // Padding to leave room for axes labels
  const paddingLeft = 48;
  const paddingRight = 20;
  const paddingTop = 16;
  const paddingBottom = 36;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = Math.max(1e-6, max - min);

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  // Map price points to SVG coordinates
  const points = prices.map((p, i) => {
    const x = paddingLeft + (i / (prices.length - 1)) * innerWidth;
    const y = paddingTop + (1 - (p - min) / range) * innerHeight;
    return [x, y] as const;
  });

  // Build line path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`)
    .join(' ');

  // Area path under the line
  const areaPath = `${linePath} L${paddingLeft + innerWidth},${paddingTop + innerHeight} L${paddingLeft},${paddingTop + innerHeight} Z`;

  // Responsive tick density based on inner width
  const yTickCount = innerWidth < 320 ? 3 : 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => paddingTop + (i / yTickCount) * innerHeight);
  const yValues = Array.from({ length: yTickCount + 1 }, (_, i) => min + (i / yTickCount) * range);

  // X axis ticks (dates)
  const xTickCount = innerWidth < 320 ? 2 : innerWidth < 480 ? 3 : 4;
  const xTickIdx = Array.from({ length: xTickCount + 1 }, (_, i) => Math.round((i / xTickCount) * (prices.length - 1)));
  const msPerDay = 24 * 60 * 60 * 1000;
  const end = endDate.getTime();
  const dateForIndex = (idx: number) => new Date(end - (prices.length - 1 - idx) * msPerDay);
  const formatDate = (d: Date) => `${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;

  // Min/Max annotations
  const minIdx = prices.indexOf(min);
  const maxIdx = prices.indexOf(max);
  const [minX, minY] = points[minIdx];
  const [maxX, maxY] = points[maxIdx];

  // Smart label placement for min/max to avoid clipping/overlap
  const maxLabelAnchor: 'start' | 'end' = maxX > paddingLeft + innerWidth - 56 ? 'end' : 'start';
  const minLabelAnchor: 'start' | 'end' = minX > paddingLeft + innerWidth - 56 ? 'end' : 'start';
  const maxLabelX = maxLabelAnchor === 'end' ? maxX - 6 : maxX + 6;
  const minLabelX = minLabelAnchor === 'end' ? minX - 6 : minX + 6;
  const maxLabelY = Math.max(10, maxY - 10);
  const minLabelY = Math.min(paddingTop + innerHeight - 4, minY + 14);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Price history chart">
      <defs>
        <linearGradient id="price-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="grid-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Y grid + labels */}
      {yTicks.map((y, i) => (
        <g key={`y-${i}`}>
          <line x1={paddingLeft} x2={paddingLeft + innerWidth} y1={y} y2={y} stroke="url(#grid-fade)" strokeWidth={1} />
          <text x={paddingLeft - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#6b7280">${yValues[i].toFixed(2)}</text>
        </g>
      ))}

      {/* X grid + labels */}
      {xTickIdx.map((idx, i) => (
        <g key={`x-${i}`}>
          <line x1={points[idx][0]} x2={points[idx][0]} y1={paddingTop} y2={paddingTop + innerHeight} stroke="#e5e7eb" strokeOpacity={0.4} strokeWidth={1} />
          <text x={points[idx][0]} y={paddingTop + innerHeight + 14} textAnchor="middle" fontSize={10} fill="#6b7280">
            {formatDate(dateForIndex(idx))}
          </text>
        </g>
      ))}

      {/* Axes lines */}
      <line x1={paddingLeft} x2={paddingLeft + innerWidth} y1={paddingTop + innerHeight} y2={paddingTop + innerHeight} stroke="#9ca3af" strokeWidth={1} />
      <line x1={paddingLeft} x2={paddingLeft} y1={paddingTop} y2={paddingTop + innerHeight} stroke="#9ca3af" strokeWidth={1} />

      {/* Area fill and line */}
      <path d={areaPath} fill="url(#price-gradient)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} />

      {/* Min/Max markers with labels */}
      <g>
        <circle cx={maxX} cy={maxY} r={3.5} fill={color} stroke="#fff" strokeWidth={1} />
        <rect x={maxLabelAnchor==='end'? maxLabelX-38 : maxLabelX-2} y={maxLabelY-10} width={40} height={14} rx={3} fill="#ffffff" opacity={0.85} />
        <text x={maxLabelX} y={maxLabelY} textAnchor={maxLabelAnchor} fontSize={10} fill="#111827">${max.toFixed(2)}</text>
      </g>
      <g>
        <circle cx={minX} cy={minY} r={3.5} fill={color} stroke="#fff" strokeWidth={1} />
        <rect x={minLabelAnchor==='end'? minLabelX-38 : minLabelX-2} y={minLabelY-10} width={40} height={14} rx={3} fill="#ffffff" opacity={0.85} />
        <text x={minLabelX} y={minLabelY} textAnchor={minLabelAnchor} fontSize={10} fill="#111827">${min.toFixed(2)}</text>
      </g>
    </svg>
  );
}


