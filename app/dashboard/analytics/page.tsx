'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Plus, X, LayoutGrid, BarChart2, Users, Activity, Clock,
  Store, ChevronDown, GripVertical, Trash2, Settings,
  TrendingUp, Info, Bell, Edit2, Download,
} from 'lucide-react';
import { VisitorSnapshots } from '@/components/VisitorSnapshots';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart,
} from 'recharts';

// ── Widget catalog ────────────────────────────────────────────────────────────
interface WidgetDef {
  id: string;
  label: string;
  description: string;
  group: 'Footfall' | 'Demographics' | 'Queue' | 'Store Performance';
  preview: React.ReactNode;
}

const PASSERBY_DATA = [
  { month: 'Jan', v: 42000 }, { month: 'Feb', v: 38000 }, { month: 'Mar', v: 45000 },
  { month: 'Apr', v: 47000 }, { month: 'May', v: 43000 }, { month: 'Jun', v: 49000 },
];
const DEMO_COLORS = ['#655BD3', '#00CE9C', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];
const DEMO_DATA = [
  { name: 'Male 22–35', value: 28 }, { name: 'Female 22–35', value: 20 },
  { name: 'Male 13–21', value: 15 }, { name: 'Female 13–21', value: 12 },
  { name: 'Male 35+', value: 15 }, { name: 'Other', value: 10 },
];
const QUEUE_DATA = [
  { hour: '9am', q: 3 }, { hour: '11am', q: 8 }, { hour: '1pm', q: 15 },
  { hour: '3pm', q: 10 }, { hour: '5pm', q: 6 }, { hour: '7pm', q: 4 },
];
const STORE_DATA = [
  { store: 'MBS', v: 15234 }, { store: 'OC', v: 12450 }, { store: 'VVC', v: 11800 },
  { store: 'BJ', v: 10200 }, { store: 'TM', v: 9600 },
];

const MINI_MONTHLY = [
  { m: 'J', footfall: 14200, passerby: 41000, male: 820, female: 680, conv: 9.8,  target: 12 },
  { m: 'F', footfall: 13800, passerby: 38000, male: 790, female: 650, conv: 10.4, target: 12 },
  { m: 'M', footfall: 15100, passerby: 43000, male: 860, female: 710, conv: 11.1, target: 12 },
  { m: 'A', footfall: 14600, passerby: 40000, male: 830, female: 690, conv: 10.6, target: 12 },
  { m: 'M2', footfall: 15234, passerby: 45621, male: 910, female: 760, conv: 12.4, target: 12 },
  { m: 'J2', footfall: 16800, passerby: 48000, male: 970, female: 820, conv: 13.1, target: 12 },
];
const MINI_HOURLY = [
  { h: '9', v: 280, q: 3 }, { h: '10', v: 390, q: 5 }, { h: '11', v: 420, q: 8 },
  { h: '12', v: 460, q: 14 }, { h: '1', v: 500, q: 18 }, { h: '2', v: 480, q: 12 },
  { h: '3', v: 440, q: 9 },
];
const MINI_STORE_PERF = [
  { store: 'MBS', v: 15234, conv: 18.2 }, { store: 'OC', v: 12450, conv: 16.8 },
  { store: 'VVC', v: 11800, conv: 15.3 }, { store: 'BJ', v: 10200, conv: 14.1 },
];
const MINI_DONUT_DATA = [
  { name: 'M 22–35', value: 28, color: '#3B82F6' }, { name: 'F 22–35', value: 20, color: '#EC4899' },
  { name: 'M 13–21', value: 15, color: '#60A5FA' }, { name: 'F 13–21', value: 12, color: '#F472B6' },
  { name: 'M 35+',   value: 15, color: '#1D4ED8' }, { name: 'Other',   value: 10, color: '#8B5CF6' },
];
const MINI_AGE = [
  { group: '0–12', pct: 11 }, { group: '13–21', pct: 19 },
  { group: '22–35', pct: 34 }, { group: '35–50', pct: 24 },
];
const MINI_COLORS = ['#655BD3', '#00CE9C', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];

function MiniWidgetPreview({ id }: { id: string }) {
  const noAxis = { top: 4, right: 4, left: -52, bottom: -16 };
  const H = 76;
  switch (id) {
    case 'footfall_trend':
      return (
        <ResponsiveContainer width="100%" height={H}>
          <BarChart data={MINI_MONTHLY} margin={noAxis} barGap={1} barCategoryGap="28%">
            <defs>
              <linearGradient id="mff1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#655BD3" stopOpacity={1}/><stop offset="100%" stopColor="#655BD3" stopOpacity={0.4}/></linearGradient>
              <linearGradient id="mff2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00CE9C" stopOpacity={1}/><stop offset="100%" stopColor="#00CE9C" stopOpacity={0.4}/></linearGradient>
            </defs>
            <Bar dataKey="footfall" fill="url(#mff1)" radius={[3,3,0,0]} />
            <Bar dataKey="passerby" fill="url(#mff2)" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'passerby_trend':
      return (
        <ResponsiveContainer width="100%" height={H}>
          <AreaChart data={MINI_MONTHLY} margin={noAxis}>
            <defs>
              <linearGradient id="mpb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00CE9C" stopOpacity={0.25}/><stop offset="100%" stopColor="#00CE9C" stopOpacity={0}/></linearGradient>
              <linearGradient id="mpb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#655BD3" stopOpacity={0.15}/><stop offset="100%" stopColor="#655BD3" stopOpacity={0}/></linearGradient>
            </defs>
            <Area type="monotone" dataKey="passerby" stroke="#00CE9C" strokeWidth={2} fill="url(#mpb1)" dot={false} />
            <Area type="monotone" dataKey="footfall" stroke="#655BD3" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#mpb2)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'peak_hours': {
      const maxV = Math.max(...MINI_HOURLY.map(d => d.v));
      return (
        <ResponsiveContainer width="100%" height={H}>
          <BarChart data={MINI_HOURLY} margin={noAxis} barCategoryGap="28%">
            <defs>
              <linearGradient id="mpk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#655BD3" stopOpacity={1}/><stop offset="100%" stopColor="#655BD3" stopOpacity={0.4}/></linearGradient>
            </defs>
            <Bar dataKey="v" radius={[3,3,0,0]}>
              {MINI_HOURLY.map((d, i) => <Cell key={i} fill={d.v === maxV ? 'url(#mpk)' : 'rgba(101,91,211,0.22)'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    case 'conversion_rate':
      return (
        <ResponsiveContainer width="100%" height={H}>
          <ComposedChart data={MINI_MONTHLY} margin={noAxis} barCategoryGap="30%">
            <defs>
              <linearGradient id="mcv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={1}/><stop offset="100%" stopColor="#F59E0B" stopOpacity={0.4}/></linearGradient>
            </defs>
            <Bar dataKey="conv" fill="url(#mcv)" radius={[3,3,0,0]} />
            <Line type="monotone" dataKey="target" stroke="#655BD3" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      );
    case 'demographics_donut':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: H }}>
          <ResponsiveContainer width={80} height={H}>
            <PieChart>
              <Pie data={MINI_DONUT_DATA} cx="50%" cy="50%" innerRadius={22} outerRadius={34} dataKey="value" paddingAngle={2}>
                {MINI_DONUT_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MINI_DONUT_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 9.5, color: '#374151', flex: 1 }}>{d.name}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#111827' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'gender_trend':
      return (
        <ResponsiveContainer width="100%" height={H}>
          <LineChart data={MINI_MONTHLY} margin={noAxis}>
            <Line type="monotone" dataKey="male" stroke="#3B82F6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="female" stroke="#EC4899" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'age_bar':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, height: H, justifyContent: 'center', padding: '2px 4px' }}>
          {MINI_AGE.map((d, i) => (
            <div key={d.group} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9, color: '#6B7280', width: 28, flexShrink: 0 }}>{d.group}</span>
              <div style={{ flex: 1, height: 7, background: '#F3F4F6', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${d.pct * 2.6}%`, background: AGE_GROUP_COLORS[i % AGE_GROUP_COLORS.length] }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#374151', width: 22, textAlign: 'right', flexShrink: 0 }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      );
    case 'queue_length': {
      const maxQ = Math.max(...MINI_HOURLY.map(d => d.q));
      return (
        <ResponsiveContainer width="100%" height={H}>
          <BarChart data={MINI_HOURLY} margin={noAxis} barCategoryGap="28%">
            <defs>
              <linearGradient id="mqh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#655BD3" stopOpacity={1}/><stop offset="100%" stopColor="#655BD3" stopOpacity={0.4}/></linearGradient>
            </defs>
            <Bar dataKey="q" radius={[3,3,0,0]}>
              {MINI_HOURLY.map((d, i) => <Cell key={i} fill={d.q === maxQ ? 'url(#mqh)' : 'rgba(101,91,211,0.22)'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    case 'wait_time': {
      const wtData = MINI_HOURLY.map(d => ({ h: d.h, wait: +(d.q * 0.28 + 0.5).toFixed(1) }));
      return (
        <ResponsiveContainer width="100%" height={H}>
          <AreaChart data={wtData} margin={noAxis}>
            <defs>
              <linearGradient id="mwt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D97706" stopOpacity={0.25}/><stop offset="100%" stopColor="#D97706" stopOpacity={0}/></linearGradient>
            </defs>
            <Area type="monotone" dataKey="wait" stroke="#D97706" strokeWidth={2} fill="url(#mwt)" dot={{ r: 2.5, fill: '#D97706', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    case 'top_stores':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: H, justifyContent: 'center', padding: '2px 0' }}>
          {MINI_STORE_PERF.map((s, i) => (
            <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9, color: '#9CA3AF', width: 10, flexShrink: 0 }}>{i+1}</span>
              <span style={{ fontSize: 9.5, color: '#374151', width: 24, flexShrink: 0 }}>{s.store}</span>
              <div style={{ flex: 1, height: 7, background: '#F3F4F6', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${(s.v / 15234) * 100}%`, background: '#655BD3' }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#111827', width: 28, textAlign: 'right', flexShrink: 0 }}>{(s.v/1000).toFixed(1)}K</span>
            </div>
          ))}
        </div>
      );
    case 'store_conversion':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: H, justifyContent: 'center', padding: '2px 0' }}>
          {MINI_STORE_PERF.map((s) => (
            <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9.5, color: '#374151', width: 24, flexShrink: 0 }}>{s.store}</span>
              <div style={{ flex: 1, height: 7, background: '#F3F4F6', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${(s.conv / 20) * 100}%`, background: '#754C7F' }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#111827', width: 28, textAlign: 'right', flexShrink: 0 }}>{s.conv}%</span>
            </div>
          ))}
        </div>
      );
    case 'store_heatmap':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, height: H, justifyContent: 'center' }}>
          {[[2,4,8,12,8,4],[4,8,12,15,12,8],[3,6,10,13,10,6]].map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 3 }}>
              {row.map((val, ci) => (
                <div key={ci} style={{ flex: 1, height: 17, borderRadius: 3, background: `rgba(101,91,211,${0.08 + (val/15)*0.85})` }} />
              ))}
            </div>
          ))}
        </div>
      );
    default:
      return <div style={{ height: H }} />;
  }
}

const ALL_WIDGETS: WidgetDef[] = [
  { id: 'footfall_trend',   label: 'Footfall Trend',         description: 'Daily/weekly traffic volume over time',   group: 'Footfall',          preview: <MiniWidgetPreview id="footfall_trend" /> },
  { id: 'passerby_trend',   label: 'Passerby Trend',         description: 'Passerby flow vs store entry',            group: 'Footfall',          preview: <MiniWidgetPreview id="passerby_trend" /> },
  { id: 'peak_hours',       label: 'Peak Hours Chart',       description: 'Busiest hours across all stores',         group: 'Footfall',          preview: <MiniWidgetPreview id="peak_hours" /> },
  { id: 'conversion_rate',  label: 'Conversion Rate',        description: 'Passerby to visitor conversion %',        group: 'Footfall',          preview: <MiniWidgetPreview id="conversion_rate" /> },
  { id: 'demographics_donut', label: 'Demographics Donut',  description: 'Age & gender breakdown of visitors',      group: 'Demographics',      preview: <MiniWidgetPreview id="demographics_donut" /> },
  { id: 'gender_trend',     label: 'Gender Trend Line',      description: 'Male vs female over time',                group: 'Demographics',      preview: <MiniWidgetPreview id="gender_trend" /> },
  { id: 'age_bar',          label: 'Age Group Bar Chart',    description: 'Visitors by age group',                   group: 'Demographics',      preview: <MiniWidgetPreview id="age_bar" /> },
  { id: 'queue_length',     label: 'Queue Length Over Time', description: 'Average queue depth per hour',            group: 'Queue',             preview: <MiniWidgetPreview id="queue_length" /> },
  { id: 'wait_time',        label: 'Avg Wait Time',          description: 'Mean wait time at peak hours',            group: 'Queue',             preview: <MiniWidgetPreview id="wait_time" /> },
  { id: 'top_stores',       label: 'Top Stores by Visitors', description: 'Ranked store performance',               group: 'Store Performance', preview: <MiniWidgetPreview id="top_stores" /> },
  { id: 'store_conversion', label: 'Store Conversion Rate',  description: 'Conversion by location',                  group: 'Store Performance', preview: <MiniWidgetPreview id="store_conversion" /> },
  { id: 'store_heatmap',    label: 'Store Heatmap',          description: 'Traffic intensity by zone',               group: 'Store Performance', preview: <MiniWidgetPreview id="store_heatmap" /> },
];

// Template definitions with icons and colors
interface TemplateDef {
  id: string;
  label: string;
  description: string;
  widgets: string[];
  icon: React.ReactNode;
  iconColor: string;
}

const TEMPLATES: TemplateDef[] = [
  {
    id: 'tpl_traffic',
    label: 'Traffic Overview',
    description: 'Footfall, passerby, peak hours & conversion',
    widgets: ['footfall_trend', 'passerby_trend', 'peak_hours', 'conversion_rate'],
    icon: <BarChart2 size={22} strokeWidth={2} />,
    iconColor: '#655BD3',
  },
  {
    id: 'tpl_demo',
    label: 'Demographics Report',
    description: 'Age groups, gender breakdown & trends',
    widgets: ['demographics_donut', 'gender_trend', 'age_bar'],
    icon: <Users size={22} strokeWidth={2} />,
    iconColor: '#00CE9C',
  },
  {
    id: 'tpl_queue',
    label: 'Queue Management',
    description: 'Wait times, queue depth & alerts',
    widgets: ['queue_length', 'wait_time', 'peak_hours'],
    icon: <Clock size={22} strokeWidth={2} />,
    iconColor: '#F59E0B',
  },
];

// ── Per-widget chart data ─────────────────────────────────────────────────────
const MONTHLY = [
  { m: 'Jan', footfall: 14200, passerby: 41000, male: 820,  female: 680, conv: 9.8,  target: 15 },
  { m: 'Feb', footfall: 13800, passerby: 38000, male: 790,  female: 650, conv: 10.4, target: 15 },
  { m: 'Mar', footfall: 15100, passerby: 43000, male: 860,  female: 710, conv: 11.1, target: 15 },
  { m: 'Apr', footfall: 14600, passerby: 40000, male: 830,  female: 690, conv: 10.6, target: 15 },
  { m: 'May', footfall: 15234, passerby: 45621, male: 910,  female: 760, conv: 12.4, target: 15 },
  { m: 'Jun', footfall: 16800, passerby: 48000, male: 970,  female: 820, conv: 13.1, target: 15 },
  { m: 'Jul', footfall: 17200, passerby: 50000, male: 1010, female: 850, conv: 13.8, target: 15 },
  { m: 'Aug', footfall: 16500, passerby: 47500, male: 960,  female: 800, conv: 13.2, target: 15 },
  { m: 'Sep', footfall: 15800, passerby: 45000, male: 920,  female: 770, conv: 12.7, target: 15 },
  { m: 'Oct', footfall: 16200, passerby: 46500, male: 940,  female: 790, conv: 13.0, target: 15 },
  { m: 'Nov', footfall: 17800, passerby: 52000, male: 1050, female: 880, conv: 14.2, target: 15 },
  { m: 'Dec', footfall: 19200, passerby: 56000, male: 1150, female: 960, conv: 15.1, target: 15 },
];
const HOURLY = [
  { h: '8am',  v: 180, q: 2  }, { h: '9am',  v: 280, q: 3  }, { h: '10am', v: 390, q: 5  },
  { h: '11am', v: 420, q: 8  }, { h: '12pm', v: 460, q: 14 }, { h: '1pm',  v: 500, q: 18 },
  { h: '2pm',  v: 480, q: 12 }, { h: '3pm',  v: 440, q: 9  }, { h: '4pm',  v: 390, q: 7  },
  { h: '5pm',  v: 350, q: 5  }, { h: '6pm',  v: 310, q: 4  }, { h: '7pm',  v: 260, q: 3  },
  { h: '8pm',  v: 190, q: 2  }, { h: '9pm',  v: 110, q: 1  },
];
const AGE_DATA = [
  { group: '0–12',  pct: 11 }, { group: '13–21', pct: 19 },
  { group: '22–35', pct: 34 }, { group: '35–50', pct: 24 }, { group: '50+',   pct: 12 },
];
const STORE_PERF = [
  { store: 'Marina Bay Sands', v: 15234, conv: 18.2 },
  { store: 'Orchard Central',  v: 12450, conv: 16.8 },
  { store: 'VivoCity',         v: 11800, conv: 15.3 },
  { store: 'Bugis Junction',   v: 10200, conv: 14.1 },
  { store: 'Tampines Mall',    v:  9600, conv: 12.7 },
  { store: 'Jurong Point',     v:  8900, conv: 11.4 },
  { store: 'Northpoint City',  v:  7800, conv: 10.2 },
  { store: 'Causeway Point',   v:  6900, conv:  9.1 },
];
const DONUT_DATA = [
  { name: 'M 22–35', value: 28, color: '#3B82F6' },
  { name: 'F 22–35', value: 20, color: '#EC4899' },
  { name: 'M 13–21', value: 15, color: '#60A5FA' },
  { name: 'F 13–21', value: 12, color: '#F472B6' },
  { name: 'M 35+',   value: 15, color: '#1D4ED8' },
  { name: 'Other',   value: 10, color: '#8B5CF6' },
];

// ── SKILL.md chart tokens ─────────────────────────────────────────────────────
const CHART_COLORS = {
  series: ['#655BD3', '#00CE9C', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'],
  male:   '#3B82F6',
  female: '#EC4899',
  highlight: '#655BD3',
  muted:     'rgba(101, 91, 211, 0.25)',
};

// ── Consistent semantic colors for demographic segments ───────────────────────
// Males → blue family, Females → pink/rose family, Other → purple
const SEGMENT_COLORS: Record<string, string> = {
  'M 22–35': '#3B82F6',   // blue-500  — largest male group
  'M 13–21': '#60A5FA',   // blue-400  — younger males (lighter)
  'M 35+':   '#1D4ED8',   // blue-700  — older males (darker)
  'M 0–12':  '#93C5FD',   // blue-300  — children males (lightest)
  'F 22–35': '#EC4899',   // pink-500  — largest female group
  'F 13–21': '#F472B6',   // pink-400  — younger females (lighter)
  'F 35+':   '#BE185D',   // pink-700  — older females (darker)
  'F 0–12':  '#F9A8D4',   // pink-300  — children females (lightest)
  'Other':   '#8B5CF6',   // purple
};

// Age-group only colors (gender-neutral, purple scale) for age_bar widget
const AGE_GROUP_COLORS = ['#C4B5FD', '#A78BFA', '#7C3AED', '#655BD3', '#4C1D95'];

const WIDGET_INFO: Record<string, { title: string; description: string; calculation: string }> = {
  footfall_trend: {
    title: 'Footfall Trend',
    description: 'Tracks total visitor entries across all stores over the selected period. Useful for identifying seasonal patterns and growth momentum.',
    calculation: 'Aggregated from entry events detected by entrance cameras. A unique visitor entry is counted once per 5-minute deduplication window per camera zone.',
  },
  passerby_trend: {
    title: 'Passerby Trend',
    description: 'Compares passerby volume (people detected outside) against actual store entries. Highlights how external foot traffic translates to visits.',
    calculation: 'Passerby count uses perimeter camera detections. Entry count uses entrance camera events. The ratio between them is the raw conversion signal.',
  },
  conversion_rate: {
    title: 'Conversion Rate',
    description: 'Shows the percentage of passersby who entered the store. The dashed line represents the monthly target threshold.',
    calculation: 'Conversion % = (Entry Events ÷ Passerby Events) × 100. Calculated per calendar month with a 15% target line.',
  },
  wait_time: {
    title: 'Average Wait Time',
    description: 'Tracks mean queue wait time per hour across all monitored service points. Peaks indicate high-demand windows.',
    calculation: 'Derived from queue length events and average service duration. Wait Time = Queue Depth × Avg Service Time per customer.',
  },
  peak_hours: {
    title: 'Peak Hours',
    description: 'Highlights the busiest hours of the day by visitor volume. The darkest bar is the peak hour — all others are shown relative to it.',
    calculation: 'Based on entry event timestamps, grouped into 1-hour buckets across all active cameras. The peak bar is the hour with the highest total count.',
  },
  demographics_donut: {
    title: 'Visitor Demographics',
    description: 'Breaks down the visitor population by age group and gender. Helps tailor in-store experiences and marketing to the dominant segments.',
    calculation: 'Inferred by the AI classification model from camera feeds. Age and gender are estimated from visual cues with ≥85% confidence threshold applied.',
  },
  gender_trend: {
    title: 'Gender Trend',
    description: 'Compares male vs female visitor volumes over time. Use this to identify shifts in your customer demographic over months.',
    calculation: 'Aggregated from the AI demographic model output per entry event. Monthly totals are summed and plotted as two independent lines.',
  },
  age_bar: {
    title: 'Age Group Distribution',
    description: 'Shows the share of visitors in each age bracket. Wider bars indicate a larger proportion of that segment in total footfall.',
    calculation: 'Each visitor entry is classified into an age bracket by the vision model. Percentages are calculated as each group\'s count ÷ total visitors × 100.',
  },
  queue_length: {
    title: 'Queue Length Over Time',
    description: 'Shows average queue depth per hour. The highlighted bar marks the peak queue hour — critical for staffing and resource planning.',
    calculation: 'Queue depth is measured as the number of people detected in a designated queue zone at each hourly snapshot. Values are averaged across all monitored queues.',
  },
  top_stores: {
    title: 'Top Stores by Visitors',
    description: 'Ranks store locations by total visitor count. Use this to compare performance across your network and identify top and bottom performers.',
    calculation: 'Total entry events per store location within the selected period. Progress bars show each store\'s share relative to the top-performing store.',
  },
  store_conversion: {
    title: 'Store Conversion Rate',
    description: 'Ranks stores by their passerby-to-entry conversion percentage. A higher rate means the store is more effective at drawing in passing traffic.',
    calculation: 'Conversion % = (Entry Events ÷ Passerby Events) × 100, calculated per store. Bars are scaled to the highest conversion rate in the dataset.',
  },
  store_heatmap: {
    title: 'Store Traffic Heatmap',
    description: 'Visualises foot traffic intensity across zones and time slots. Darker cells indicate higher congestion — useful for zone planning and staffing.',
    calculation: 'Intensity = zone visitor count ÷ zone capacity × 100. Colours map to 5 intensity tiers from low (light purple) to high (solid purple).',
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
      <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 2 : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#D1D5DB' }}>{entry.name}</span>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 700, marginLeft: 'auto', paddingLeft: 12 }}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const ChartLegend = ({ items }: { items: { color: string; label: string; dash?: boolean }[] }) => (
  <div style={{
    display: 'flex', flexWrap: 'wrap', gap: '4px 20px',
    paddingTop: 8, marginTop: 6,
    borderTop: '1px solid #F3F4F6', flexShrink: 0,
  }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {item.dash ? (
          <svg width="18" height="10" style={{ flexShrink: 0, display: 'block' }}>
            <line x1="0" y1="5" x2="18" y2="5" stroke={item.color} strokeWidth="2" strokeDasharray="5 3" />
          </svg>
        ) : (
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 11, color: '#6B7280' }}>{item.label}</span>
      </div>
    ))}
  </div>
);

// ── Global Legend Table ───────────────────────────────────────────────────────
function GlobalLegend() {
  const trafficItems = [
    { color: '#655BD3', label: 'Footfall' },
    { color: '#00CE9C', label: 'Passerby' },
    { color: '#F59E0B', label: 'Conversion %' },
  ];
  const genderItems = [
    { color: CHART_COLORS.male,   label: 'Male'   },
    { color: CHART_COLORS.female, label: 'Female' },
  ];
  const segmentItems = [
    { color: SEGMENT_COLORS['M 22–35'], label: 'M 22–35' },
    { color: SEGMENT_COLORS['F 22–35'], label: 'F 22–35' },
    { color: SEGMENT_COLORS['M 13–21'], label: 'M 13–21' },
    { color: SEGMENT_COLORS['F 13–21'], label: 'F 13–21' },
    { color: SEGMENT_COLORS['M 35+'],   label: 'M 35+'   },
    { color: SEGMENT_COLORS['Other'],   label: 'Other'   },
  ];
  const ageItems = [
    { color: AGE_GROUP_COLORS[0], label: '0–12'  },
    { color: AGE_GROUP_COLORS[1], label: '13–21' },
    { color: AGE_GROUP_COLORS[2], label: '22–35' },
    { color: AGE_GROUP_COLORS[3], label: '35–50' },
    { color: AGE_GROUP_COLORS[4], label: '50+'   },
  ];

  const Section = ({ title, items }: { title: string; items: { color: string; label: string }[] }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 14px' }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 0 2px ${item.color}22` }} />
            <span style={{ fontSize: 11.5, color: '#374151', whiteSpace: 'nowrap' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '14px 20px',
      marginBottom: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 28,
      flexWrap: 'wrap',
    }}>
      <Section title="Traffic" items={trafficItems} />
      <div style={{ width: 1, alignSelf: 'stretch', background: '#F3F4F6', flexShrink: 0 }} />
      <Section title="Gender" items={genderItems} />
      <div style={{ width: 1, alignSelf: 'stretch', background: '#F3F4F6', flexShrink: 0 }} />
      <Section title="Demographics (Age × Gender)" items={segmentItems} />
      <div style={{ width: 1, alignSelf: 'stretch', background: '#F3F4F6', flexShrink: 0 }} />
      <Section title="Age Groups" items={ageItems} />
    </div>
  );
}

function InfoTooltip({ widgetId }: { widgetId: string }) {
  const [show, setShow] = useState(false);
  const info = WIDGET_INFO[widgetId];
  if (!info) return null;
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        style={{
          width: 22, height: 22, borderRadius: '50%',
          background: '#6B7280',
          border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', flexShrink: 0,
          transition: 'background 150ms',
          padding: 0,
        }}
        onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#655BD3'; }}
        onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#6B7280'; }}
      >
        <Info size={12} strokeWidth={2} />
      </button>
      {show && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 272, background: '#fff',
          border: '1px solid #E5E7EB', borderRadius: 12,
          padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.11)',
          zIndex: 200,
        }}>
          <div style={{
            position: 'absolute', top: -5, right: 8,
            width: 10, height: 10, background: '#fff',
            border: '1px solid #E5E7EB', borderBottom: 'none', borderRight: 'none',
            transform: 'rotate(45deg)',
          }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{info.title}</p>
          <p style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.6, marginBottom: 10 }}>{info.description}</p>
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 10px' }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>How it&apos;s calculated</p>
            <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.6 }}>{info.calculation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Smooth SVG sparkline helper
function Sparkline({ data, color, h = 50 }: { data: number[]; color: string; h?: number }) {
  const W = 200;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: h - ((v - min) / (max - min || 1)) * (h - 4) - 2,
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cp} ${pts[i-1].y} ${cp} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }
  const area = `${d} L ${pts[pts.length-1].x} ${h} L 0 ${h} Z`;
  const gid = `sg_${color.replace('#','')}`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// KPI + sparkline card body
function KpiSparkWidget({ value, label, color, data, suffix = '' }: {
  value: string; label: string; color: string; data: number[]; suffix?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}{suffix}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{label}</div>
      </div>
      <div style={{ flex: 1, minHeight: 60 }}>
        <Sparkline data={data} color={color} h={70} />
      </div>
    </div>
  );
}

// ── Widget accent colours (module-level so the chip strip can use them too) ───
const WIDGET_ACCENT: Record<string, string> = {
  footfall_trend: '#655BD3', passerby_trend: '#00CE9C', peak_hours: '#655BD3',
  conversion_rate: '#F59E0B', demographics_donut: '#655BD3', gender_trend: '#3B82F6',
  age_bar: '#EC4899', queue_length: '#DC2626', wait_time: '#D97706',
  top_stores: '#3B82F6', store_conversion: '#655BD3', store_heatmap: '#8B5CF6',
};

// ── Widget renderer ───────────────────────────────────────────────────────────
function PlacedWidget({
  widgetId,
  onRemove,
  editMode = false,
  dragIndex,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  widgetId: string;
  onRemove: () => void;
  editMode?: boolean;
  dragIndex?: number;
  onDragStart?: (i: number) => void;
  onDragEnter?: (i: number) => void;
  onDragEnd?: () => void;
}) {
  const def = ALL_WIDGETS.find(w => w.id === widgetId);
  if (!def) return null;

  const color = WIDGET_ACCENT[widgetId] ?? '#655BD3';
  const [showSnapshots, setShowSnapshots] = useState(false);

  function renderChart() {
    switch (widgetId) {
      case 'footfall_trend':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width={700} height="100%">
                <BarChart data={MONTHLY} margin={{ top: 8, right: 0, left: -20, bottom: 0 }} barCategoryGap="35%">
                  <defs>
                    <linearGradient id="ffGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#655BD3" stopOpacity={1} />
                      <stop offset="100%" stopColor="#655BD3" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="ffGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00CE9C" stopOpacity={1} />
                      <stop offset="100%" stopColor="#00CE9C" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
                  <Bar dataKey="footfall" name="Footfall" fill="url(#ffGrad1)" radius={[6,6,0,0]} />
                  <Bar dataKey="passerby" name="Passerby" fill="url(#ffGrad2)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'passerby_trend': {
        const passData = MONTHLY.map(d => ({ ...d, prev: Math.round(d.passerby * 0.88) }));
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width={700} height="100%">
                <AreaChart data={passData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pbGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00CE9C" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#00CE9C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pbGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#655BD3" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#655BD3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="passerby" name="This month" stroke="#00CE9C" strokeWidth={2.5} fill="url(#pbGrad1)" dot={false} activeDot={{ r: 5, fill: '#00CE9C', stroke: '#fff', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="prev" name="Prev month" stroke="#655BD3" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#pbGrad2)" dot={false} activeDot={{ r: 5, fill: '#655BD3', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case 'conversion_rate': {
        const convData = MONTHLY.map(d => ({ ...d, target: 15 }));
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width={700} height="100%">
                <ComposedChart data={convData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: any) => `${v}%`} domain={[0, 20]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,158,11,0.06)' }} />
                  <Bar dataKey="conv" name="Conversion %" fill="url(#convGrad)" radius={[6,6,0,0]} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#655BD3" strokeWidth={1.5} strokeDasharray="6 3" dot={false} activeDot={{ r: 5, fill: '#655BD3', stroke: '#fff', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case 'wait_time': {
        const wtHourly = HOURLY.map(d => ({ h: d.h, wait: +(d.q * 0.28 + 0.5).toFixed(1) }));
        return (
          <ResponsiveContainer width={650} height="100%">
            <AreaChart data={wtHourly} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: any) => `${v}m`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="wait" name="Avg wait" stroke="#D97706" strokeWidth={2.5} fill="url(#wtGrad)" dot={false} activeDot={{ r: 5, fill: '#D97706', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        );
      }

      case 'peak_hours': {
        const peakMax = Math.max(...HOURLY.map(d => d.v));
        return (
          <ResponsiveContainer width={650} height="100%">
            <BarChart data={HOURLY} margin={{ top: 8, right: 0, left: -20, bottom: 0 }} barCategoryGap="35%">
              <defs>
                <linearGradient id="peakHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#655BD3" stopOpacity={1} />
                  <stop offset="100%" stopColor="#655BD3" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
              <Bar dataKey="v" name="Visitors" radius={[6,6,0,0]}>
                {HOURLY.map((d, i) => (
                  <Cell key={i} fill={d.v === peakMax ? 'url(#peakHigh)' : CHART_COLORS.muted} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'demographics_donut':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: '100%' }}>
            {/* Donut — fixed width */}
            <div style={{ width: 148, height: '100%', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={44} outerRadius={64} dataKey="value" paddingAngle={2}>
                    {DONUT_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend — 2-column grid, each item self-contained */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '7px 24px',
              alignContent: 'center',
              flex: 1,
            }}>
              {DONUT_DATA.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, color: '#374151', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#111827', marginLeft: 'auto', paddingLeft: 8 }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'gender_trend':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width={700} height="100%">
                <LineChart data={MONTHLY} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="male" name="Male" stroke={CHART_COLORS.male} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: CHART_COLORS.male, stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="female" name="Female" stroke={CHART_COLORS.female} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: CHART_COLORS.female, stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'age_bar': {
        const CustomLabel = ({ x, y, width, height, value }: any) => (
          <text x={x + width + 8} y={y + height / 2 + 1} fill="#374151" fontSize={12} fontWeight={600} dominantBaseline="middle">{value}%</text>
        );
        const ageBarData = AGE_DATA.map(d => ({ ...d, value: d.pct }));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageBarData} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barCategoryGap="30%">
              <XAxis type="number" hide />
              <YAxis dataKey="group" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }} width={50} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
              <Bar dataKey="value" radius={[0,6,6,0]} label={<CustomLabel />}>
                {ageBarData.map((_, i) => <Cell key={i} fill={AGE_GROUP_COLORS[i % AGE_GROUP_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'queue_length': {
        const maxQ = Math.max(...HOURLY.map(d => d.q));
        return (
          <ResponsiveContainer width={650} height="100%">
            <BarChart data={HOURLY} margin={{ top: 8, right: 0, left: -20, bottom: 0 }} barCategoryGap="35%">
              <defs>
                <linearGradient id="queueHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#655BD3" stopOpacity={1} />
                  <stop offset="100%" stopColor="#655BD3" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
              <Bar dataKey="q" name="Queue depth" radius={[6,6,0,0]}>
                {HOURLY.map((d, i) => (
                  <Cell key={i} fill={d.q === maxQ ? 'url(#queueHigh)' : CHART_COLORS.muted} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'top_stores':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            {STORE_PERF.map((s, i) => (
              <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < STORE_PERF.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF', width: 16, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#374151', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store}</span>
                <div style={{ width: 128, height: 6, background: '#F3F4F6', borderRadius: 99, flexShrink: 0 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${(s.v / 15234) * 100}%`, backgroundColor: '#655BD3' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', width: 48, textAlign: 'right', flexShrink: 0 }}>
                  {(s.v / 1000).toFixed(1)}K
                </span>
              </div>
            ))}
          </div>
        );

      case 'store_conversion':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            {STORE_PERF.map((s, i) => (
              <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < STORE_PERF.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <span style={{ fontSize: 13, color: '#374151', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store}</span>
                <div style={{ width: 128, height: 6, background: '#F3F4F6', borderRadius: 99, flexShrink: 0 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${(s.conv / 20) * 100}%`, backgroundColor: '#754C7F' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', width: 48, textAlign: 'right', flexShrink: 0 }}>{s.conv}%</span>
              </div>
            ))}
          </div>
        );

      case 'store_heatmap': {
        const HEATMAP_COLORS = [
          { min: 0,  max: 20,  bg: '#EEE9FF', text: '#655BD3' },
          { min: 20, max: 40,  bg: '#DDD6FF', text: '#5549C0' },
          { min: 40, max: 60,  bg: '#C4B5FD', text: '#4A3FAD' },
          { min: 60, max: 80,  bg: '#A78BFA', text: '#fff' },
          { min: 80, max: 100, bg: '#655BD3', text: '#fff' },
        ];
        const getHeatColor = (val: number) =>
          HEATMAP_COLORS.find(c => val >= c.min && val < c.max) ?? HEATMAP_COLORS[0];
        const hmRows = ['Ent A', 'Ent B', 'L1', 'L2', 'L3'];
        const hmCols = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm'];
        const hmData = [
          [13, 27, 40, 53, 40, 27, 13],
          [20, 40, 60, 80, 60, 40, 20],
          [27, 47, 73, 100, 73, 47, 27],
          [20, 33, 53, 67, 53, 33, 20],
          [13, 27, 40, 47, 40, 27, 13],
        ];
        return (
          <div style={{ overflowX: 'auto', height: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ width: 48, textAlign: 'left', color: '#6B7280', fontWeight: 500, paddingBottom: 6 }} />
                  {hmCols.map(col => (
                    <th key={col} style={{ textAlign: 'center', color: '#6B7280', fontWeight: 500, paddingBottom: 6, paddingLeft: 4, paddingRight: 4 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hmRows.map((row, ri) => (
                  <tr key={row}>
                    <td style={{ color: '#374151', fontWeight: 500, paddingRight: 6, paddingTop: 3, paddingBottom: 3, whiteSpace: 'nowrap' }}>{row}</td>
                    {hmCols.map((_, ci) => {
                      const val = hmData[ri][ci];
                      const { bg, text } = getHeatColor(val);
                      return (
                        <td key={ci} style={{ padding: '3px 4px' }}>
                          <div style={{
                            backgroundColor: bg, color: text,
                            borderRadius: 4, textAlign: 'center',
                            padding: '4px 0', fontSize: 10, fontWeight: 500,
                            minWidth: 32,
                          }}>
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
        );
      }

      default:
        return (
          <div style={{ display: 'flex', height: '100%' }}>
            <Sparkline data={MONTHLY.map(d => d.footfall)} color={color} h={120} />
          </div>
        );
    }
  }

  return (
    <div
      className="card relative"
      style={{
        minHeight: 240, padding: 20,
        ...(editMode ? { border: '2px dashed #C4B5FD', cursor: 'grab' } : {}),
      }}
      draggable={editMode}
      onDragStart={() => onDragStart?.(dragIndex ?? 0)}
      onDragEnter={() => onDragEnter?.(dragIndex ?? 0)}
      onDragEnd={() => onDragEnd?.()}
    >
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {editMode && (
            <GripVertical size={14} strokeWidth={2} style={{ color: '#9CA3AF', marginRight: 4, flexShrink: 0, cursor: 'grab' }} />
          )}
          <span style={{ width: 3, height: 14, borderRadius: 2, background: color, flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{def.label}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {widgetId === 'footfall_trend' && !editMode && (
            <button
              onClick={() => setShowSnapshots(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 6,
                border: `1px solid ${showSnapshots ? '#655BD3' : '#E5E7EB'}`,
                background: showSnapshots ? '#EEE9FF' : 'white',
                color: showSnapshots ? '#655BD3' : '#6B7280',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <Bell size={12} strokeWidth={2} />
              New Snapshots
            </button>
          )}
          {editMode ? (
            <button
              onClick={onRemove}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: '#FEE2E2', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#DC2626', flexShrink: 0,
              }}
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          ) : (
            <InfoTooltip widgetId={widgetId} />
          )}
        </div>
      </div>

      {/* Chart area */}
      <div style={{ height: 180, overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ minWidth: '100%', height: '100%' }}>
          {renderChart()}
        </div>
      </div>

      {/* Snapshots modal — footfall_trend only */}
      {widgetId === 'footfall_trend' && showSnapshots && (
        <div
          onClick={() => setShowSnapshots(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(17,24,39,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#F9FAFB',
              borderRadius: 16,
              width: '100%',
              maxWidth: 1100,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
              overflow: 'hidden',
            }}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'white',
              borderBottom: '1px solid #E5E7EB',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={15} strokeWidth={2} style={{ color: '#655BD3' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Visitor Snapshots</span>
                <span style={{
                  fontSize: 10.5, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 999,
                  background: 'rgba(101,91,211,0.1)', color: '#655BD3',
                }}>Live</span>
              </div>
              <button
                onClick={() => setShowSnapshots(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: '1px solid #E5E7EB', background: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#6B7280',
                }}
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable snapshots content */}
            <div style={{ overflowY: 'auto', padding: '24px 24px' }}>
              <VisitorSnapshots />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Analytics Tab interface ───────────────────────────────────────────────────
interface AnalyticsTab {
  id: string;
  label: string;
  widgets: string[];
}

// ── Add Widgets Modal ─────────────────────────────────────────────────────────
function AddWidgetsModal({ onClose, onAdd }: { onClose: () => void; onAdd: (ids: string[]) => void }) {
  const [activeTab, setActiveTab] = useState<'widgets' | 'templates'>('widgets');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const groups = Array.from(new Set(ALL_WIDGETS.map(w => w.group)));

  const toggleWidget = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSelectedTemplate(null);
  };

  const selectTemplate = (tplId: string) => {
    const tpl = TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    setSelectedTemplate(tplId);
    setSelected(new Set(tpl.widgets));
  };

  const handleAdd = () => {
    onAdd(Array.from(selected));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl flex flex-col"
        style={{ borderRadius: 16, width: 640, maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: '#111827' }}>Add Widgets</h3>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Choose widgets or start from a template</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md" style={{ color: '#9CA3AF' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-3 gap-1" style={{ borderBottom: '1px solid #F3F4F6' }}>
          {(['widgets', 'templates'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-sm font-medium capitalize transition-colors rounded-t-md"
              style={{
                color: activeTab === tab ? '#655BD3' : '#6B7280',
                borderBottom: activeTab === tab ? '2px solid #655BD3' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'widgets' ? (
            <div className="space-y-5">
              {groups.map(group => (
                <div key={group}>
                  <p className="text-xs font-bold uppercase mb-2.5" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>{group}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ALL_WIDGETS.filter(w => w.group === group).map(widget => {
                      const isSelected = selected.has(widget.id);
                      return (
                        <button
                          key={widget.id}
                          onClick={() => toggleWidget(widget.id)}
                          className="text-left rounded-xl overflow-hidden transition-all"
                          style={{
                            border: `1.5px solid ${isSelected ? '#655BD3' : '#E5E7EB'}`,
                            background: 'white',
                            boxShadow: isSelected ? '0 0 0 3px #EEE9FF' : 'none',
                          }}
                        >
                          {/* Chart preview area */}
                          <div style={{
                            background: '#F8F7FF',
                            borderBottom: `1px solid ${isSelected ? '#DDD6FE' : '#F3F4F6'}`,
                            padding: '12px 12px 8px',
                            pointerEvents: 'none',
                          }}>
                            {widget.preview}
                          </div>
                          {/* Label */}
                          <div style={{ padding: '8px 10px 9px' }}>
                            <p style={{ fontSize: 11.5, fontWeight: 600, color: isSelected ? '#655BD3' : '#111827' }}>{widget.label}</p>
                            <p style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 2 }}>{widget.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Templates — same grid + visual preview style as CreatePageModal */
            <div className="grid grid-cols-3 gap-4">
              {TEMPLATES.map(tpl => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => selectTemplate(tpl.id)}
                    className="text-left rounded-xl overflow-hidden transition-all"
                    style={{
                      border: `2px solid ${isSelected ? '#655BD3' : '#E5E7EB'}`,
                      background: 'white',
                      boxShadow: isSelected ? '0 0 0 3px #EEE9FF' : 'none',
                    }}
                  >
                    <div style={{ background: '#F8F7FF', borderBottom: `1px solid ${isSelected ? '#DDD6FE' : '#F3F4F6'}`, padding: '14px 14px 10px' }}>
                      {tpl.id === 'tpl_traffic' && <TrafficPreview color={tpl.iconColor} />}
                      {tpl.id === 'tpl_demo'    && <DemoPreview    color={tpl.iconColor} />}
                      {tpl.id === 'tpl_queue'   && <QueuePreview   color={tpl.iconColor} />}
                    </div>
                    <div style={{ padding: '10px 12px 12px' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#655BD3' : '#111827' }}>{tpl.label}</p>
                      <p style={{ fontSize: 10.5, marginTop: 3, color: '#9CA3AF', lineHeight: 1.4 }}>{tpl.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid #F3F4F6' }}
        >
          <span className="text-sm" style={{ color: '#6B7280' }}>
            {selected.size > 0 ? `${selected.size} widget${selected.size > 1 ? 's' : ''} selected` : 'No widgets selected'}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ border: '1px solid #E5E7EB', color: '#374151' }}
            >Cancel</button>
            <button
              onClick={handleAdd}
              disabled={selected.size === 0}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
              style={{ background: '#655BD3', opacity: selected.size === 0 ? 0.5 : 1 }}
            >Add {selected.size > 0 ? `(${selected.size})` : ''}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Template preview SVGs ─────────────────────────────────────────────────────

function TrafficPreview({ color }: { color: string }) {
  // KPI row + area chart
  const areaPoints = [
    [0, 52], [18, 44], [36, 38], [54, 30], [72, 20], [90, 26], [108, 14], [126, 10],
  ];
  const linePath = areaPoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const areaPath = `${linePath} L126,62 L0,62 Z`;
  return (
    <svg width="100%" viewBox="0 0 160 90" style={{ display: 'block' }}>
      {/* KPI chips */}
      {[['15.2K', 'Footfall', 0], ['45.6K', 'Passerby', 55], ['12.4%', 'Conv.', 110]].map(([val, lbl, x]) => (
        <g key={lbl as string}>
          <rect x={Number(x)} y={0} width={46} height={22} rx={5} fill="white" stroke="#E5E7EB" strokeWidth={1} />
          <text x={Number(x) + 7} y={9} fontSize={6} fill="#9CA3AF">{lbl as string}</text>
          <text x={Number(x) + 7} y={18} fontSize={8} fontWeight="700" fill="#111827">{val as string}</text>
          <rect x={Number(x) + 34} y={12} width={6} height={3} rx={1} fill={color} opacity={0.6} />
        </g>
      ))}
      {/* Area chart */}
      <defs>
        <linearGradient id="tpg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform="translate(17,26)">
        <path d={areaPath} fill="url(#tpg1)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* X axis labels */}
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <text key={i} x={i * 18 + 2} y={70} fontSize={6} fill="#9CA3AF" textAnchor="middle">{d}</text>
        ))}
      </g>
    </svg>
  );
}

function DemoPreview({ color }: { color: string }) {
  // Donut + horizontal bars
  const R = 20, cx = 34, cy = 42, sw = 7;
  const segments = [
    { pct: 0.30, c: '#655BD3' }, { pct: 0.22, c: color },
    { pct: 0.18, c: '#F59E0B' }, { pct: 0.14, c: '#3B82F6' },
    { pct: 0.10, c: '#EC4899' }, { pct: 0.06, c: '#9CA3AF' },
  ];
  let cumAngle = -Math.PI / 2;
  const arcs = segments.map(seg => {
    const start = cumAngle;
    const sweep = seg.pct * 2 * Math.PI;
    cumAngle += sweep;
    const x1 = cx + R * Math.cos(start);
    const y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(cumAngle - 0.001);
    const y2 = cy + R * Math.sin(cumAngle - 0.001);
    const large = sweep > Math.PI ? 1 : 0;
    return { d: `M${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)}`, c: seg.c };
  });

  const bars = [
    { label: 'Male 22–35', pct: 0.30, c: '#655BD3' },
    { label: 'Female 22–35', pct: 0.22, c: color },
    { label: 'Male 13–21', pct: 0.18, c: '#F59E0B' },
    { label: 'Female 13–21', pct: 0.14, c: '#3B82F6' },
  ];

  return (
    <svg width="100%" viewBox="0 0 160 90" style={{ display: 'block' }}>
      {/* Donut */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill="none" stroke={a.c} strokeWidth={sw} strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={8} fontWeight="700" fill="#111827">15.2K</text>
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize={5.5} fill="#9CA3AF">visitors</text>
      {/* Bars */}
      {bars.map((b, i) => (
        <g key={b.label} transform={`translate(74, ${8 + i * 19})`}>
          <text y={7} fontSize={6} fill="#6B7280">{b.label}</text>
          <rect y={10} width={80} height={5} rx={2} fill="#F3F4F6" />
          <rect y={10} width={80 * b.pct} height={5} rx={2} fill={b.c} />
          <text x={84} y={15} fontSize={6} fill="#374151" fontWeight="600">{Math.round(b.pct * 100)}%</text>
        </g>
      ))}
    </svg>
  );
}

function QueuePreview({ color }: { color: string }) {
  // KPI row + bar chart
  const queueData = [3, 6, 11, 18, 14, 9, 5, 4];
  const hours = ['9a','11a','1p','3p','5p','7p','8p','9p'];
  const maxQ = 18;
  const bw = 13, gap = 3, chartH = 46, chartY = 30;

  return (
    <svg width="100%" viewBox="0 0 160 90" style={{ display: 'block' }}>
      {/* KPI chips */}
      {[['4.2 min', 'Avg Wait', 0], ['18', 'Peak Queue', 82]].map(([val, lbl, x]) => (
        <g key={lbl as string}>
          <rect x={Number(x)} y={0} width={72} height={22} rx={5} fill="white" stroke="#E5E7EB" strokeWidth={1} />
          <text x={Number(x) + 8} y={9} fontSize={6} fill="#9CA3AF">{lbl as string}</text>
          <text x={Number(x) + 8} y={18} fontSize={9} fontWeight="700" fill="#111827">{val as string}</text>
        </g>
      ))}
      {/* Bar chart */}
      {queueData.map((v, i) => {
        const bh = (v / maxQ) * chartH;
        const x = 6 + i * (bw + gap);
        const y = chartY + chartH - bh;
        const isPeak = v === maxQ;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={2}
              fill={isPeak ? color : `${color}55`} />
            <text x={x + bw / 2} y={chartY + chartH + 9} textAnchor="middle" fontSize={5.5} fill="#9CA3AF">{hours[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Create Page Modal ─────────────────────────────────────────────────────────
function CreatePageModal({ onClose, onCreate }: { onClose: () => void; onCreate: (label: string, widgets: string[]) => void }) {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');
  const [isCustomCard, setIsCustomCard] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customSelected, setCustomSelected] = useState<Set<string>>(new Set());

  const groups = Array.from(new Set(ALL_WIDGETS.map(w => w.group)));

  const toggleCustomWidget = (id: string) => {
    setCustomSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplate(tplId);
    setIsCustomCard(false);
    setActiveTab('templates');
  };

  const handleSelectCustom = () => {
    setSelectedTemplate(null);
    setIsCustomCard(true);
    setActiveTab('custom');
  };

  const handleCreate = () => {
    const title = pageTitle.trim();
    if (!title) return;

    let widgets: string[] = [];
    if (activeTab === 'templates' && selectedTemplate) {
      const tpl = TEMPLATES.find(t => t.id === selectedTemplate);
      widgets = tpl ? tpl.widgets : [];
    } else if (activeTab === 'custom') {
      widgets = Array.from(customSelected);
    }

    onCreate(title, widgets);
    onClose();
  };

  const canCreate = pageTitle.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl flex flex-col"
        style={{ borderRadius: 16, width: 600, maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-bold" style={{ color: '#111827' }}>Create New Page</h3>
            <button onClick={onClose} className="p-1.5 rounded-md" style={{ color: '#9CA3AF' }}>
              <X size={18} strokeWidth={2} />
            </button>
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Choose a template or build from scratch</p>

          {/* Page title input */}
          <div className="mt-4">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#374151' }}>Page Title</label>
            <input
              type="text"
              placeholder="e.g. Traffic Overview, Store Performance…"
              value={pageTitle}
              onChange={e => setPageTitle(e.target.value)}
              autoFocus
              className="w-full text-sm rounded-xl px-4 py-2.5 outline-none"
              style={{ border: '1.5px solid #E5E7EB', color: '#111827', transition: 'border-color 0.15s' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#655BD3'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['templates', 'custom'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 text-sm font-medium capitalize transition-colors"
                style={{
                  color: activeTab === tab ? '#655BD3' : '#6B7280',
                  borderBottom: activeTab === tab ? '2px solid #655BD3' : '2px solid transparent',
                }}
              >
                {tab === 'templates' ? 'Templates' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'templates' ? (
            <div className="grid grid-cols-3 gap-4">
              {TEMPLATES.map(tpl => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className="text-left rounded-xl overflow-hidden transition-all"
                    style={{
                      border: `2px solid ${isSelected ? '#655BD3' : '#E5E7EB'}`,
                      background: 'white',
                      boxShadow: isSelected ? '0 0 0 3px #EEE9FF' : 'none',
                    }}
                  >
                    {/* Mini dashboard preview */}
                    <div style={{ background: '#F8F7FF', borderBottom: `1px solid ${isSelected ? '#DDD6FE' : '#F3F4F6'}`, padding: '14px 14px 10px' }}>
                      {tpl.id === 'tpl_traffic' && <TrafficPreview color={tpl.iconColor} />}
                      {tpl.id === 'tpl_demo'    && <DemoPreview    color={tpl.iconColor} />}
                      {tpl.id === 'tpl_queue'   && <QueuePreview   color={tpl.iconColor} />}
                    </div>
                    {/* Label */}
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: isSelected ? '#655BD3' : '#111827' }}>{tpl.label}</p>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#9CA3AF' }}>{tpl.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom widget picker */
            <div className="space-y-5">
              {groups.map(group => (
                <div key={group}>
                  <p className="text-xs font-bold uppercase mb-2.5" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>{group}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ALL_WIDGETS.filter(w => w.group === group).map(widget => {
                      const isSelected = customSelected.has(widget.id);
                      return (
                        <button
                          key={widget.id}
                          onClick={() => toggleCustomWidget(widget.id)}
                          className="text-left rounded-xl overflow-hidden transition-all"
                          style={{
                            border: `1.5px solid ${isSelected ? '#655BD3' : '#E5E7EB'}`,
                            background: 'white',
                            boxShadow: isSelected ? '0 0 0 3px #EEE9FF' : 'none',
                          }}
                        >
                          <div style={{
                            background: '#F8F7FF',
                            borderBottom: `1px solid ${isSelected ? '#DDD6FE' : '#F3F4F6'}`,
                            padding: '12px 12px 8px',
                            pointerEvents: 'none',
                          }}>
                            {widget.preview}
                          </div>
                          <div style={{ padding: '8px 10px 9px' }}>
                            <p style={{ fontSize: 11.5, fontWeight: 600, color: isSelected ? '#655BD3' : '#111827' }}>{widget.label}</p>
                            <p style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 2 }}>{widget.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid #F3F4F6', flexShrink: 0 }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ border: '1px solid #E5E7EB', color: '#374151' }}
          >Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
            style={{ background: '#655BD3', opacity: canCreate ? 1 : 0.4, cursor: canCreate ? 'pointer' : 'not-allowed' }}
          >Create Page</button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [tabs, setTabs] = useState<AnalyticsTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showAddWidgets, setShowAddWidgets] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftWidgets, setDraftWidgets] = useState<string[]>([]);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const currentTab = tabs.find(t => t.id === activeTab) ?? null;

  const handleCreatePage = (label: string, widgets: string[]) => {
    const id = `tab_${Date.now()}`;
    const newTab: AnalyticsTab = { id, label, widgets };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(id);
  };

  const deleteTab = (id: string) => {
    setTabs(prev => {
      const remaining = prev.filter(t => t.id !== id);
      if (activeTab === id) {
        setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      }
      return remaining;
    });
  };

  const addWidgets = (widgetIds: string[]) => {
    if (!activeTab) return;
    setTabs(prev => prev.map(t =>
      t.id === activeTab
        ? { ...t, widgets: Array.from(new Set([...t.widgets, ...widgetIds])) }
        : t
    ));
  };

  const removeWidget = (widgetId: string) => {
    if (!activeTab) return;
    setTabs(prev => prev.map(t =>
      t.id === activeTab ? { ...t, widgets: t.widgets.filter(w => w !== widgetId) } : t
    ));
  };

  const enterEditMode = () => {
    if (!currentTab) return;
    setDraftWidgets([...currentTab.widgets]);
    setIsEditMode(true);
  };

  const saveLayout = () => {
    if (!activeTab) return;
    setTabs(prev => prev.map(t =>
      t.id === activeTab ? { ...t, widgets: draftWidgets } : t
    ));
    setIsEditMode(false);
    setDraftWidgets([]);
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
    setDraftWidgets([]);
  };

  const handleDragSort = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const arr = [...draftWidgets];
    const dragged = arr.splice(dragItem.current, 1)[0];
    arr.splice(dragOver.current, 0, dragged);
    dragItem.current = null;
    dragOver.current = null;
    setDraftWidgets(arr);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top tab bar — only shown when pages exist */}
      {tabs.length > 0 && (
        <div
          className="flex items-center px-6 pt-4"
          style={{ borderBottom: '1px solid #E5E7EB', background: 'white', flexShrink: 0, gap: 2 }}
        >
          {/* Page tabs */}
          {tabs.map(tab => (
            <div key={tab.id} className="relative group flex items-center">
              <button
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-t-md"
                style={{
                  color: activeTab === tab.id ? '#655BD3' : '#6B7280',
                  borderBottom: activeTab === tab.id ? '2px solid #655BD3' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
              <button
                onClick={() => deleteTab(tab.id)}
                className="opacity-0 group-hover:opacity-100 ml-0.5 p-0.5 rounded transition-opacity"
                style={{ color: '#9CA3AF' }}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          ))}

          {/* New Page button */}
          <button
            onClick={() => setShowCreatePage(true)}
            className="flex items-center gap-1 ml-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ color: '#655BD3', border: '1px solid #DDD6FE', background: '#F5F3FF' }}
          >
            <Plus size={13} strokeWidth={2} />
            New Page
          </button>

          <div className="flex-1" />

          {/* Add Widgets + Edit Layout — shown when a page is active */}
          {activeTab && (
            <div className="flex items-center gap-2 pb-1">
              {isEditMode ? (
                <button
                  onClick={cancelEditMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
                >
                  <X size={13} strokeWidth={2.5} />
                  Cancel Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowAddWidgets(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: '#655BD3', color: 'white' }}
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    Add Widgets
                  </button>
                  {currentTab && currentTab.widgets.length > 0 && (
                    <button
                      onClick={enterEditMode}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}
                    >
                      <Edit2 size={12} strokeWidth={2} />
                      Edit Layout
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}


      {/* Edit mode banner */}
      {isEditMode && (
        <div
          style={{
            background: '#EEE9FF',
            borderBottom: '1px solid #DDD6FE',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Edit2 size={13} strokeWidth={2} style={{ color: '#655BD3' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#655BD3' }}>Editing Analytics Layout</span>
            <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4 }}>
              · Drag to reorder · × to remove
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={cancelEditMode}
              style={{
                padding: '6px 16px', borderRadius: 8,
                border: '1px solid #DDD6FE',
                background: 'white', color: '#655BD3',
                fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
              }}
            >Cancel</button>
            <button
              onClick={saveLayout}
              style={{
                padding: '6px 16px', borderRadius: 8,
                border: 'none',
                background: '#655BD3', color: 'white',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              }}
            >Save Layout</button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: '#F9FAFB' }}>
        {tabs.length === 0 ? (
          /* ── Empty state: no pages ── */
          <div className="flex flex-col items-center justify-center h-full" style={{ minHeight: 400 }}>
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: '#EEE9FF' }}
            >
              <BarChart2 size={40} strokeWidth={1.5} style={{ color: '#655BD3' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>No analytics pages yet</h3>
            <p className="text-sm mb-6 text-center max-w-xs" style={{ color: '#6B7280' }}>
              Create your first page and start adding widgets, charts, and metrics tailored to your stores.
            </p>
            <button
              onClick={() => setShowCreatePage(true)}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: '#655BD3' }}
            >
              + Create First Page
            </button>
          </div>
        ) : currentTab ? (
          currentTab.widgets.length === 0 ? (
            /* Tab empty state */
            <div className="flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ background: '#F3F4F6' }}
              >
                <LayoutGrid size={24} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#374151' }}>This page is empty</p>
              <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Add widgets to start building your analytics view</p>
              <button
                onClick={() => setShowAddWidgets(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#655BD3' }}
              >
                <Plus size={14} strokeWidth={2} />
                Add Widgets
              </button>
            </div>
          ) : (
            <>
            <GlobalLegend />
            <div className="grid grid-cols-2 gap-4">
              {(isEditMode ? draftWidgets : currentTab.widgets).map((widgetId, index) => (
                <PlacedWidget
                  key={widgetId}
                  widgetId={widgetId}
                  onRemove={() => {
                    if (isEditMode) {
                      setDraftWidgets(prev => prev.filter(w => w !== widgetId));
                    } else {
                      removeWidget(widgetId);
                    }
                  }}
                  editMode={isEditMode}
                  dragIndex={index}
                  onDragStart={(i) => { dragItem.current = i; }}
                  onDragEnter={(i) => { dragOver.current = i; }}
                  onDragEnd={handleDragSort}
                />
              ))}
            </div>
            </>
          )
        ) : null}
      </div>

      {/* Modals */}
      {showAddWidgets && (
        <AddWidgetsModal
          onClose={() => setShowAddWidgets(false)}
          onAdd={addWidgets}
        />
      )}
      {showCreatePage && (
        <CreatePageModal
          onClose={() => setShowCreatePage(false)}
          onCreate={handleCreatePage}
        />
      )}
    </div>
  );
}
