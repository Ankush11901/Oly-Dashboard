# Chart Styling — Modern Aesthetic Dashboard Charts

## When to use this skill

Use this skill whenever building, fixing, or improving any chart component in the OlyRetail dashboard. This covers every chart type: bar, line, area, donut, heatmap, scatter, gauge, spark line. If a chart looks flat, bland, or generic — apply this skill.

---

## Stack

- **Chart library:** Recharts (React-native, TypeScript-compatible)
- **Styling:** Tailwind CSS for card wrappers, CSS custom properties for chart tokens
- **Framework:** React / Next.js + TypeScript
- **Icons:** Lucide React

Install if not present:
```bash
npm install recharts
npm install @types/recharts
```

---

## Core Design Rules — Always Apply These

### 1. Rounded bars — always
Every bar chart must have rounded top corners. Never flat-topped bars.
```tsx
// In Recharts Bar component
<Bar dataKey="value" radius={[6, 6, 0, 0]} />

// For horizontal bars
<Bar dataKey="value" radius={[0, 6, 6, 0]} />
```

### 2. Gradient fills — always on bars and area charts
Never use flat solid fills. Always use a gradient or at minimum a semi-transparent fill.

```tsx
// Define gradients in a <defs> block inside <BarChart>
<defs>
  <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#655BD3" stopOpacity={1} />
    <stop offset="100%" stopColor="#655BD3" stopOpacity={0.4} />
  </linearGradient>
  <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#00CE9C" stopOpacity={1} />
    <stop offset="100%" stopColor="#00CE9C" stopOpacity={0.4} />
  </linearGradient>
  <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#655BD3" stopOpacity={0.15} />
    <stop offset="100%" stopColor="#655BD3" stopOpacity={0} />
  </linearGradient>
</defs>

// Use the gradient
<Bar dataKey="value" fill="url(#gradPrimary)" radius={[6, 6, 0, 0]} />
<Area fill="url(#gradArea)" stroke="#655BD3" strokeWidth={2} />
```

### 3. Custom tooltips — never use the default
The default Recharts tooltip is generic and ugly. Always replace it.

```tsx
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A2E] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] text-neutral-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[12px] text-white font-medium">
            {entry.name}
          </span>
          <span className="text-[14px] text-white font-bold ml-auto pl-4">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Use in chart
<Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
```

### 4. Styled axes — subtle, never bold
```tsx
<XAxis
  dataKey="name"
  axisLine={false}
  tickLine={false}
  tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Neue Haas Grotesk Display Pro' }}
/>
<YAxis
  axisLine={false}
  tickLine={false}
  tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Neue Haas Grotesk Display Pro' }}
  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
/>
```

### 5. Subtle grid lines — dashed, never solid
```tsx
<CartesianGrid
  strokeDasharray="4 4"
  stroke="#F3F4F6"
  vertical={false}
/>
```

### 6. Smooth lines — always use monotone curve
```tsx
<Line type="monotone" strokeWidth={2} dot={false} />
<Area type="monotone" strokeWidth={2} />
```

For lines with dots on hover only:
```tsx
<Line
  type="monotone"
  strokeWidth={2}
  dot={false}
  activeDot={{ r: 5, fill: '#655BD3', stroke: '#fff', strokeWidth: 2 }}
/>
```

### 7. Chart card wrapper — consistent across all charts
Every chart lives inside this card structure:

```tsx
// ChartCard.tsx
interface ChartCardProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const ChartCard = ({
  title,
  subtitle,
  accentColor = '#655BD3',
  children,
  actions,
}: ChartCardProps) => (
  <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        {/* Accent bar */}
        <div
          className="w-1 rounded-full mt-0.5 flex-shrink-0"
          style={{ height: subtitle ? '36px' : '20px', backgroundColor: accentColor }}
        />
        <div>
          <h3 className="text-[14px] font-bold text-[#111827] leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[12px] text-[#6B7280] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    {children}
  </div>
);
```

### 8. Responsive container — always wrap charts
```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data} barCategoryGap="35%">
    {/* chart content */}
  </BarChart>
</ResponsiveContainer>
```

---

## Colour Rules for Charts

Always use colours in this order for multi-series charts:

```ts
export const CHART_COLORS = {
  series: ['#655BD3', '#00CE9C', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'],
  male:   '#3B82F6',
  female: '#EC4899',
  // Age × gender 10-colour pastel system (from live dashboard)
  ageGender: [
    '#E2725B', '#71AEC7', '#FFC300', '#7676EB', '#FF80B4',
    '#E7AFA4', '#AFCDDA', '#F6D877', '#B2B2EC', '#F1D2DF',
  ],
  // Semantic
  highlight: '#655BD3',  // peak bar, active state
  muted:     'rgba(101, 91, 211, 0.25)', // non-peak bars
  forecast:  'rgba(101, 91, 211, 0.5)',  // dashed / projected
};
```

For bar charts with a highlighted peak (like Queue Length):
```tsx
// Highlight the peak bar, mute the rest
const getBarFill = (value: number, data: any[]) => {
  const max = Math.max(...data.map((d) => d.value));
  return value === max ? '#655BD3' : 'rgba(101, 91, 211, 0.3)';
};

<Bar dataKey="value" radius={[6, 6, 0, 0]}>
  {data.map((entry, index) => (
    <Cell key={index} fill={getBarFill(entry.value, data)} />
  ))}
</Bar>
```

---

## Chart-by-Chart Specifications

### Bar Chart (Vertical) — e.g. Queue Length, Peak Hours, Footfall Trend

```tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

<ChartCard title="Queue Length Over Time" subtitle="Average queue depth per hour" accentColor="#DC2626">
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} barCategoryGap="40%" margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#655BD3" stopOpacity={1} />
          <stop offset="100%" stopColor="#655BD3" stopOpacity={0.5} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
      <XAxis dataKey="hour" axisLine={false} tickLine={false}
        tick={{ fill: '#6B7280', fontSize: 11 }} />
      <YAxis axisLine={false} tickLine={false}
        tick={{ fill: '#6B7280', fontSize: 11 }} />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.isPeak ? '#655BD3' : 'rgba(101,91,211,0.3)'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</ChartCard>
```

---

### Area / Line Chart — e.g. Footfall Trend, Passerby Trend, Gender Trend

```tsx
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Area chart
<ChartCard title="Passerby Trend" subtitle="Passerby flow vs store entry" accentColor="#00CE9C">
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={data} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#655BD3" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#655BD3" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00CE9C" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#00CE9C" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
      <XAxis dataKey="month" axisLine={false} tickLine={false}
        tick={{ fill: '#6B7280', fontSize: 11 }} />
      <YAxis axisLine={false} tickLine={false}
        tick={{ fill: '#6B7280', fontSize: 11 }}
        tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey="passerby" stroke="#00CE9C" strokeWidth={2}
        fill="url(#areaGrad2)" dot={false}
        activeDot={{ r: 5, fill: '#00CE9C', stroke: '#fff', strokeWidth: 2 }} />
      <Area type="monotone" dataKey="entry" stroke="#655BD3" strokeWidth={2}
        fill="url(#areaGrad1)" dot={false}
        activeDot={{ r: 5, fill: '#655BD3', stroke: '#fff', strokeWidth: 2 }} />
    </AreaChart>
  </ResponsiveContainer>
</ChartCard>

// Multi-line chart (Gender Trend)
<ChartCard title="Gender Trend Line" subtitle="Male vs female over time">
  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={data} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
      <XAxis dataKey="month" axisLine={false} tickLine={false}
        tick={{ fill: '#6B7280', fontSize: 11 }} />
      <YAxis axisLine={false} tickLine={false}
        tick={{ fill: '#6B7280', fontSize: 11 }}
        tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="male" stroke="#3B82F6" strokeWidth={2.5}
        dot={false} activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
      <Line type="monotone" dataKey="female" stroke="#EC4899" strokeWidth={2.5}
        dot={false} activeDot={{ r: 5, fill: '#EC4899', stroke: '#fff', strokeWidth: 2 }} />
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

---

### Horizontal Bar Chart — e.g. Age Group, Store Conversion Rate

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Custom label on the right
const CustomLabel = ({ x, y, width, height, value }: any) => (
  <text
    x={x + width + 8}
    y={y + height / 2 + 1}
    fill="#374151"
    fontSize={12}
    fontWeight={600}
    dominantBaseline="middle"
  >
    {value}%
  </text>
);

<ChartCard title="Age Group Bar Chart" subtitle="Visitors by age group">
  <ResponsiveContainer width="100%" height={220}>
    <BarChart
      data={data}
      layout="vertical"
      margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
      barCategoryGap="30%"
    >
      <XAxis type="number" hide />
      <YAxis
        dataKey="group" type="category" axisLine={false} tickLine={false}
        tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
        width={50}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
      <Bar dataKey="value" radius={[0, 6, 6, 0]} label={<CustomLabel />}>
        {data.map((entry, i) => (
          <Cell key={i} fill={CHART_COLORS.series[i % CHART_COLORS.series.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</ChartCard>
```

---

### Donut Chart — e.g. Demographics Donut

Use ApexCharts for donuts — it handles the centre label more cleanly than Recharts.

```tsx
// Install: npm install apexcharts react-apexcharts
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const DonutChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const options: ApexCharts.ApexOptions = {
    chart: { type: 'donut', background: 'transparent', animations: { enabled: false } },
    labels: data.map((d) => d.label),
    colors: data.map((d) => d.color),
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ['#fff'] },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '12px',
              fontFamily: 'Neue Haas Grotesk Display Pro',
              color: '#6B7280',
              formatter: (w) =>
                w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toLocaleString(),
            },
            value: {
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'Neue Haas Grotesk Display Pro',
              color: '#111827',
            },
          },
        },
      },
    },
    tooltip: {
      style: { fontFamily: 'Neue Haas Grotesk Display Pro', fontSize: '12px' },
      fillSeriesColor: false,
    },
  };

  return (
    <ChartCard title="Demographics Donut" subtitle="Age & gender breakdown of visitors">
      <div className="flex items-center gap-6">
        <ReactApexChart
          options={options}
          series={data.map((d) => d.value)}
          type="donut"
          width={180}
          height={180}
        />
        {/* Custom legend */}
        <div className="flex flex-col gap-2 flex-1">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[12px] text-[#374151]">{item.label}</span>
              </div>
              <span className="text-[13px] font-bold text-[#111827]">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};
```

---

### Store List with Progress Bars — e.g. Top Stores by Visitors, Store Conversion Rate

This is not a chart library component — build it as pure Tailwind:

```tsx
interface StoreRowProps {
  rank?: number;
  name: string;
  value: string;
  percentage: number; // 0-100
  color?: string;
}

const StoreRow = ({ rank, name, value, percentage, color = '#655BD3' }: StoreRowProps) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-[#F3F4F6] last:border-0">
    {rank && (
      <span className="text-[12px] text-[#9CA3AF] w-4 flex-shrink-0">{rank}</span>
    )}
    <span className="text-[13px] text-[#374151] flex-1 min-w-0 truncate">{name}</span>
    <div className="w-32 h-1.5 bg-[#F3F4F6] rounded-full flex-shrink-0">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
    <span className="text-[13px] font-semibold text-[#111827] w-12 text-right flex-shrink-0">
      {value}
    </span>
  </div>
);

<ChartCard title="Top Stores by Visitors" subtitle="Ranked store performance">
  <div className="mt-2">
    {stores.map((store, i) => (
      <StoreRow key={i} rank={i + 1} {...store} />
    ))}
  </div>
</ChartCard>
```

---

### Heatmap — e.g. Store Heatmap (Traffic by Zone)

Build as a pure CSS grid — do not use a chart library for this:

```tsx
const HEATMAP_COLORS = [
  { min: 0,  max: 20,  bg: '#EEE9FF', text: '#655BD3' },
  { min: 20, max: 40,  bg: '#DDD6FF', text: '#5549C0' },
  { min: 40, max: 60,  bg: '#C4B5FD', text: '#4A3FAD' },
  { min: 60, max: 80,  bg: '#A78BFA', text: '#fff' },
  { min: 80, max: 100, bg: '#655BD3', text: '#fff' },
];

const getHeatColor = (value: number) =>
  HEATMAP_COLORS.find((c) => value >= c.min && value < c.max) || HEATMAP_COLORS[0];

interface HeatmapProps {
  rows: string[];
  cols: string[];
  data: number[][];  // data[row][col] = 0-100
}

const Heatmap = ({ rows, cols, data }: HeatmapProps) => (
  <ChartCard title="Store Heatmap" subtitle="Traffic intensity by zone">
    <div className="mt-2 overflow-x-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className="w-16 text-left text-[#6B7280] font-medium pb-2" />
            {cols.map((col) => (
              <th key={col} className="text-center text-[#6B7280] font-medium pb-2 px-1">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row}>
              <td className="text-[#374151] font-medium pr-2 py-1 whitespace-nowrap">{row}</td>
              {cols.map((_, ci) => {
                const val = data[ri][ci];
                const { bg, text } = getHeatColor(val);
                return (
                  <td key={ci} className="px-1 py-1">
                    <div
                      className="rounded text-center py-1.5 text-[10px] font-medium transition-opacity hover:opacity-80 cursor-default"
                      style={{ backgroundColor: bg, color: text, minWidth: '32px' }}
                      title={`${val}%`}
                    >
                      {val}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </ChartCard>
);
```

---

### Combo Chart — Bar + Line overlay (e.g. Conversion Rate)

```tsx
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

<ChartCard title="Conversion Rate" subtitle="Passerby to visitor conversion %" accentColor="#F59E0B">
  <ResponsiveContainer width="100%" height={220}>
    <ComposedChart data={data} margin={{ top: 8, right: 24, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.5} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
      <XAxis dataKey="month" axisLine={false} tickLine={false}
        tick={{ fill: '#6B7280', fontSize: 11 }} />
      <YAxis yAxisId="left" axisLine={false} tickLine={false}
        tick={{ fill: '#6B7280', fontSize: 11 }}
        tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false}
        tick={{ fill: '#6B7280', fontSize: 11 }}
        tickFormatter={(v) => `${v}%`} />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,158,11,0.06)' }} />
      <Bar yAxisId="left" dataKey="visitors" fill="url(#convGrad)" radius={[6, 6, 0, 0]} />
      <Line yAxisId="right" type="monotone" dataKey="conversionRate"
        stroke="#655BD3" strokeWidth={2} strokeDasharray="6 3"
        dot={false} activeDot={{ r: 5, fill: '#655BD3', stroke: '#fff', strokeWidth: 2 }} />
    </ComposedChart>
  </ResponsiveContainer>
</ChartCard>
```

---

## Legend Component — Always Custom

Never use the built-in Recharts `<Legend />`. Build this instead:

```tsx
interface LegendItem {
  color: string;
  label: string;
}

const ChartLegend = ({ items }: { items: LegendItem[] }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-[11px] text-[#6B7280]">{item.label}</span>
      </div>
    ))}
  </div>
);
```

---

## Anti-patterns — Never Do These

- Never use `fill="solid colour"` on bars — always use gradient via `fill="url(#id)"`
- Never use `radius={0}` on bars — always `[6,6,0,0]` vertical, `[0,6,6,0]` horizontal
- Never use the default `<Tooltip />` — always `content={<CustomTooltip />}`
- Never use the default `<Legend />` — always use `<ChartLegend />`
- Never use `strokeDasharray` on regular lines — only on forecast/projected data
- Never use more than 6 colour series in one chart
- Never render a chart without a `<ResponsiveContainer>`
- Never skip `axisLine={false}` and `tickLine={false}` on axes
- Never use `vertical={true}` on `<CartesianGrid>` — horizontal lines only
- Never hardcode chart colours — always use `CHART_COLORS` tokens

---

## File locations

```
src/
├── components/
│   ├── charts/
│   │   ├── ChartCard.tsx          ← Wrapper card
│   │   ├── CustomTooltip.tsx      ← Shared tooltip
│   │   ├── ChartLegend.tsx        ← Shared legend
│   │   ├── StoreRow.tsx           ← Progress bar list row
│   │   ├── Heatmap.tsx            ← CSS grid heatmap
│   │   └── index.ts               ← Re-exports
│   └── ...
├── lib/
│   └── chartColors.ts             ← CHART_COLORS token export
```

---

## Quick fix checklist — apply to any existing bland chart

- [ ] Add `radius={[6, 6, 0, 0]}` to every `<Bar>`
- [ ] Add gradient `<defs>` and replace `fill="#colour"` with `fill="url(#grad)"`
- [ ] Replace `<Tooltip />` with `content={<CustomTooltip />}`
- [ ] Add `axisLine={false}` and `tickLine={false}` to all axes
- [ ] Change `<CartesianGrid vertical={true}>` to `vertical={false}` with `strokeDasharray="4 4"`
- [ ] Replace `<Legend />` with `<ChartLegend items={[...]} />`
- [ ] Wrap all charts in `<ChartCard>` with title, subtitle, and accentColor
- [ ] Add `type="monotone"` to all `<Line>` and `<Area>` components
- [ ] Add `dot={false}` and `activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}` to lines
