'use client';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus, X, LayoutGrid, BarChart2, Users, Activity, Clock,
  Store, ChevronDown, GripVertical, Trash2, Settings,
  TrendingUp, Info, Bell, Edit2, Download, Eye, RefreshCw,
} from 'lucide-react';
import { VisitorSnapshots } from '@/components/VisitorSnapshots';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Treemap,
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
const DEMO_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];
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
const MINI_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];

function MiniWidgetPreview({ id }: { id: string }) {
  const noAxis = { top: 4, right: 4, left: -52, bottom: -16 };
  const H = 76;
  switch (id) {
    case 'footfall_trend':
      return (
        <ResponsiveContainer width="100%" height={H}>
          <BarChart data={MINI_MONTHLY} margin={noAxis} barGap={1} barCategoryGap="28%">
            <defs>
              <linearGradient id="mff1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1}/><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.4}/></linearGradient>
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
              <linearGradient id="mpb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.15}/><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0}/></linearGradient>
            </defs>
            <Area type="monotone" dataKey="passerby" stroke="#00CE9C" strokeWidth={2} fill="url(#mpb1)" dot={false} />
            <Area type="monotone" dataKey="footfall" stroke="var(--chart-1)" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#mpb2)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'peak_hours': {
      const maxV = Math.max(...MINI_HOURLY.map(d => d.v));
      return (
        <ResponsiveContainer width="100%" height={H}>
          <BarChart data={MINI_HOURLY} margin={noAxis} barCategoryGap="28%">
            <defs>
              <linearGradient id="mpk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1}/><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.4}/></linearGradient>
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
            <Line type="monotone" dataKey="target" stroke="var(--chart-1)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
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
                <span style={{ fontSize: 9.5, color: 'var(--color-text-2)', flex: 1 }}>{d.name}</span>
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
              <span style={{ fontSize: 9, color: 'var(--color-text-3)', width: 28, flexShrink: 0 }}>{d.group}</span>
              <div style={{ flex: 1, height: 7, background: 'var(--color-surface-2)', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${d.pct * 2.6}%`, background: AGE_GROUP_COLORS[i % AGE_GROUP_COLORS.length] }} />
              </div>
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
              <linearGradient id="mqh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1}/><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.4}/></linearGradient>
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
              <span style={{ fontSize: 9.5, color: 'var(--color-text-2)', width: 24, flexShrink: 0 }}>{s.store}</span>
              <div style={{ flex: 1, height: 7, background: 'var(--color-surface-2)', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${(s.v / 15234) * 100}%`, background: 'var(--color-primary-emphasis)' }} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'store_conversion':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: H, justifyContent: 'center', padding: '2px 0' }}>
          {MINI_STORE_PERF.map((s) => (
            <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9.5, color: 'var(--color-text-2)', width: 24, flexShrink: 0 }}>{s.store}</span>
              <div style={{ flex: 1, height: 7, background: 'var(--color-surface-2)', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${(s.conv / 20) * 100}%`, background: '#754C7F' }} />
              </div>
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
    case 'overall_footfall_trends':
      return (
        <ResponsiveContainer width="100%" height={H}>
          <ComposedChart data={INDIA_WALKIN_HOURLY.slice(0, 7)} margin={{ top: 4, right: 4, left: -52, bottom: -16 }}>
            <Bar dataKey="walkins" fill="var(--chart-1)" radius={[2,2,0,0]} fillOpacity={0.85} />
            <Line type="monotone" dataKey="prev" stroke="#00CE9C" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      );
    case 'footfall_age_groups':
      return (
        <ResponsiveContainer width="100%" height={H}>
          <BarChart data={AGE_GROUP_HOURLY.slice(0, 7)} margin={{ top: 4, right: 4, left: -52, bottom: -16 }} barCategoryGap="20%">
            <Bar dataKey="kids"   stackId="a" fill="#F59E0B" />
            <Bar dataKey="teens"  stackId="a" fill="var(--chart-1)" />
            <Bar dataKey="youths" stackId="a" fill="#00CE9C" />
            <Bar dataKey="mature" stackId="a" fill="#EC4899" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'footfall_gender':
      return (
        <ResponsiveContainer width="100%" height={H}>
          <BarChart data={GENDER_HOURLY.slice(0, 7)} margin={{ top: 4, right: 4, left: -52, bottom: -16 }} barGap={2} barCategoryGap="28%">
            <Bar dataKey="male"   fill="#3B82F6" radius={[2,2,0,0]} />
            <Bar dataKey="female" fill="#EC4899" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'footfall_heatmap': {
      const colors = ['var(--chart-6)','var(--chart-1)','var(--chart-6)','#A78BFA','#C4B5FD','var(--color-accent-border)','var(--color-accent-bg-hover)','var(--color-accent-bg)'];
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, height: H, alignContent: 'flex-start' }}>
          {HEATMAP_TREEMAP_DATA.map((d, i) => (
            <div key={d.name} style={{ background: colors[i], borderRadius: 3, padding: '2px 4px', flexShrink: 0 }}>
              <span style={{ fontSize: 8, color: i < 4 ? '#fff' : 'var(--color-text-2)', fontWeight: 600 }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      );
    }
    case 'demographics_breakdown':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: H }}>
          <ResponsiveContainer width={80} height={H}>
            <PieChart>
              <Pie data={GENDER_PIE_DATA} cx="50%" cy="50%" innerRadius={18} outerRadius={30} dataKey="value" paddingAngle={2}>
                {GENDER_PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <ResponsiveContainer width={80} height={H}>
            <PieChart>
              <Pie data={AGE_RANGE_PIE_DATA} cx="50%" cy="50%" innerRadius={18} outerRadius={30} dataKey="value" paddingAngle={2}>
                {AGE_RANGE_PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    case 'store_performance_footfall':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, height: H, justifyContent: 'center', padding: '2px 0' }}>
          {STORE_DEMO_PERF.slice(0,4).map(s => (
            <div key={s.store}>
              <div style={{ display: 'flex', height: 6, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${s.kids}%`, background: '#F59E0B' }} />
                <div style={{ width: `${s.teens}%`, background: 'var(--color-primary-emphasis)' }} />
                <div style={{ width: `${s.youths}%`, background: '#00CE9C' }} />
                <div style={{ width: `${s.mature}%`, background: '#EC4899' }} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'store_performance_overall':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: H, justifyContent: 'center', padding: '2px 0' }}>
          {TOP5_STORES.map((s, i) => (
            <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 6, background: 'var(--color-surface-2)', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${(s.visitors/15234)*100}%`, background: i < 3 ? '#00CE9C' : '#93C5FD' }} />
              </div>
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
  { id: 'overall_footfall_trends',   label: 'Overall Footfall Trends',      description: 'Pan India vs location-wise walk-in traffic',      group: 'Footfall',          preview: <MiniWidgetPreview id="overall_footfall_trends" /> },
  { id: 'footfall_age_groups',       label: 'Footfall by Age Groups',       description: 'Age-group traffic by hour and region',             group: 'Demographics',      preview: <MiniWidgetPreview id="footfall_age_groups" /> },
  { id: 'footfall_gender',           label: 'Footfall by Gender',           description: 'Gender-split traffic by hour and region',          group: 'Demographics',      preview: <MiniWidgetPreview id="footfall_gender" /> },
  { id: 'footfall_heatmap',          label: 'Regional Footfall Heatmap',    description: 'Treemap of visitor distribution by region/state',  group: 'Footfall',          preview: <MiniWidgetPreview id="footfall_heatmap" /> },
  { id: 'demographics_breakdown',    label: 'Demographics Breakdown',       description: 'Gender and age-range pie chart breakdown',         group: 'Demographics',      preview: <MiniWidgetPreview id="demographics_breakdown" /> },
  { id: 'store_performance_footfall',label: 'Store Performance by Footfall',description: 'Store rankings with demographic breakdown',        group: 'Store Performance', preview: <MiniWidgetPreview id="store_performance_footfall" /> },
  { id: 'store_performance_overall', label: 'Store Performance Overview',   description: 'Top 5 and bottom 5 stores by visitors',           group: 'Store Performance', preview: <MiniWidgetPreview id="store_performance_overall" /> },
  { id: 'india_walkin_chart',    label: 'Pan India Walk-in Traffic',    description: 'Hourly walk-in vs previous period',               group: 'Footfall',          preview: <MiniWidgetPreview id="overall_footfall_trends" /> },
  { id: 'region_compare_chart',  label: 'Region Walk-in Comparison',   description: 'This year vs last year by region',                group: 'Footfall',          preview: <MiniWidgetPreview id="overall_footfall_trends" /> },
  { id: 'age_grp_hourly',        label: 'Age Groups by Hour',           description: 'Stacked age-group traffic per hour',              group: 'Demographics',      preview: <MiniWidgetPreview id="footfall_age_groups" /> },
  { id: 'age_grp_regional',      label: 'Age Groups by Region',         description: 'Stacked age-group traffic per region',            group: 'Demographics',      preview: <MiniWidgetPreview id="footfall_age_groups" /> },
  { id: 'gender_by_hour',        label: 'Gender Traffic by Hour',       description: 'Male vs female visitors per hour',                group: 'Demographics',      preview: <MiniWidgetPreview id="footfall_gender" /> },
  { id: 'gender_by_region',      label: 'Gender Traffic by Region',     description: 'Male vs female visitors per region',              group: 'Demographics',      preview: <MiniWidgetPreview id="footfall_gender" /> },
  { id: 'gender_breakdown_pie',  label: 'Gender Distribution',          description: 'Gender share as a donut chart',                   group: 'Demographics',      preview: <MiniWidgetPreview id="demographics_breakdown" /> },
  { id: 'age_breakdown_pie',     label: 'Age Range Distribution',       description: 'Age range share as a donut chart',                group: 'Demographics',      preview: <MiniWidgetPreview id="demographics_breakdown" /> },
  { id: 'store_demo_ranking',    label: 'Store Demographic Footfall',   description: 'Store rankings with demographic segment bars',    group: 'Store Performance', preview: <MiniWidgetPreview id="store_performance_footfall" /> },
  { id: 'store_staff_assist',    label: 'Staff Assist by Store',        description: 'Assist duration buckets per store',               group: 'Store Performance', preview: <MiniWidgetPreview id="store_performance_footfall" /> },
  { id: 'top5_performers',       label: 'Top 5 Performing Stores',      description: 'Ranked top 5 stores by visitor count',           group: 'Store Performance', preview: <MiniWidgetPreview id="top_stores" /> },
  { id: 'bottom5_performers',    label: 'Bottom 5 Performing Stores',   description: 'Ranked bottom 5 stores by visitor count',        group: 'Store Performance', preview: <MiniWidgetPreview id="top_stores" /> },
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
    iconColor: 'var(--color-primary)',
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

// ── Timeframe datasets ────────────────────────────────────────────────────────
type Timeframe = 'D' | 'W' | 'M' | 'Y';

const WEEKLY = [
  { m: 'Mon', footfall: 2100, passerby: 6100, male: 120, female: 100, conv: 9.5,  target: 15 },
  { m: 'Tue', footfall: 2350, passerby: 6800, male: 135, female: 115, conv: 10.1, target: 15 },
  { m: 'Wed', footfall: 2200, passerby: 6400, male: 128, female: 108, conv: 9.8,  target: 15 },
  { m: 'Thu', footfall: 2480, passerby: 7200, male: 140, female: 122, conv: 10.3, target: 15 },
  { m: 'Fri', footfall: 2700, passerby: 7800, male: 158, female: 134, conv: 10.9, target: 15 },
  { m: 'Sat', footfall: 3200, passerby: 9200, male: 188, female: 162, conv: 11.5, target: 15 },
  { m: 'Sun', footfall: 2900, passerby: 8300, male: 168, female: 144, conv: 11.1, target: 15 },
];

const YEARLY = [
  { m: '2020', footfall: 148000, passerby: 430000, male: 8800,  female: 7200,  conv: 10.2, target: 15 },
  { m: '2021', footfall: 162000, passerby: 471000, male: 9600,  female: 8000,  conv: 10.8, target: 15 },
  { m: '2022', footfall: 178000, passerby: 516000, male: 10600, female: 8800,  conv: 11.2, target: 15 },
  { m: '2023', footfall: 192000, passerby: 557000, male: 11400, female: 9500,  conv: 11.8, target: 15 },
  { m: '2024', footfall: 205000, passerby: 595000, male: 12200, female: 10100, conv: 12.4, target: 15 },
  { m: '2025', footfall: 218000, passerby: 632000, male: 13000, female: 10800, conv: 13.0, target: 15 },
];

function getTfData(tf: Timeframe) {
  switch (tf) {
    case 'D': return HOURLY.map(d => ({ m: d.h, footfall: d.v, passerby: Math.round(d.v * 3.2), male: Math.round(d.v * 0.54), female: Math.round(d.v * 0.46), conv: +(8 + d.q * 0.3).toFixed(1), target: 15 }));
    case 'W': return WEEKLY;
    case 'Y': return YEARLY;
    default:  return MONTHLY;
  }
}

function getChartData(tf: Timeframe) {
  const tfData = getTfData(tf);
  const sScale = tf === 'D' ? 0.033 : tf === 'W' ? 0.233 : tf === 'M' ? 1 : 12;
  const rScale = tf === 'D' ? 0.033 : tf === 'W' ? 0.23  : tf === 'M' ? 1 : 12;

  const peakHours = tfData.map(d => ({
    h: d.m,
    v: d.footfall,
    q: Math.round(d.footfall / (tf === 'Y' ? 6000 : tf === 'M' ? 600 : tf === 'W' ? 90 : 18)),
  }));

  const waitTime = peakHours.map(d => ({
    h: d.h,
    wait: +(d.q * 0.28 + 0.8).toFixed(1),
  }));

  const storePerfData = STORE_PERF.map(s => ({ ...s, v: Math.round(s.v * sScale) }));
  const top5          = TOP5_STORES.map(s    => ({ ...s, visitors: Math.round(s.visitors * sScale) }));
  const bottom5       = BOTTOM5_STORES.map(s => ({ ...s, visitors: Math.round(s.visitors * sScale) }));
  const storeDemoPerf = STORE_DEMO_PERF.map(s => ({ ...s, visitors: Math.round(s.visitors * sScale) }));
  const top5Max       = Math.max(...top5.map(s => s.visitors)) || 1;

  const indiaWalkin = tf === 'D'
    ? INDIA_WALKIN_HOURLY
    : tfData.map(d => ({ h: d.m, walkins: Math.round(d.footfall * 8), prev: Math.round(d.footfall * 8 * 0.88) }));

  const regionCompare = REGION_COMPARE_DATA.map(r => ({
    region: r.region, lastYear: Math.round(r.lastYear * rScale), thisYear: Math.round(r.thisYear * rScale),
  }));

  const ageGroupTime = tf === 'D'
    ? AGE_GROUP_HOURLY
    : tfData.map(d => ({
        h: d.m,
        kids:   Math.round(d.footfall * 0.086),
        teens:  Math.round(d.footfall * 0.152),
        youths: Math.round(d.footfall * 0.343),
        mature: Math.round(d.footfall * 0.262),
      }));

  const ageGroupRegional = AGE_GROUP_REGIONAL.map(r => ({
    region: r.region,
    kids:   Math.round(r.kids   * rScale),
    teens:  Math.round(r.teens  * rScale),
    youths: Math.round(r.youths * rScale),
    mature: Math.round(r.mature * rScale),
  }));

  const genderTime = tf === 'D'
    ? GENDER_HOURLY
    : tfData.map(d => ({ h: d.m, male: d.male, female: d.female }));

  const genderRegional = GENDER_REGIONAL.map(r => ({
    region: r.region, male: Math.round(r.male * rScale), female: Math.round(r.female * rScale),
  }));

  const hmCols =
    tf === 'D' ? ['9am',  '10am', '11am', '12pm', '1pm',  '2pm',  '3pm'] :
    tf === 'W' ? ['Mon',  'Tue',  'Wed',  'Thu',  'Fri',  'Sat',  'Sun'] :
    tf === 'M' ? ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'] :
                 ['Q1',   'Q2',   'Q3',   'Q4'];

  const hmData: number[][] =
    tf === 'D' ? [
      [13, 27, 40, 53, 40, 27, 13],
      [20, 40, 60, 80, 60, 40, 20],
      [27, 47, 73, 100, 73, 47, 27],
      [20, 33, 53, 67, 53, 33, 20],
      [13, 27, 40, 47, 40, 27, 13],
    ] :
    tf === 'W' ? [
      [35, 42, 48, 55, 68, 95, 80],
      [42, 50, 60, 68, 82, 100, 88],
      [55, 65, 78, 85, 92, 100, 95],
      [45, 52, 62, 72, 78, 88, 80],
      [30, 38, 45, 52, 60, 72, 65],
    ] :
    tf === 'M' ? [
      [55, 62, 78, 85],
      [65, 72, 88, 92],
      [75, 85, 95, 100],
      [60, 68, 80, 88],
      [45, 52, 62, 70],
    ] : [
      [62, 78, 88, 72],
      [72, 88, 95, 82],
      [82, 95, 100, 90],
      [68, 82, 90, 78],
      [55, 68, 75, 65],
    ];

  const totalFootfall =
    tf === 'D' ? '5,842' : tf === 'W' ? '42,890' : tf === 'M' ? '1,24,134' : '14,82,560';
  const totalChange =
    tf === 'D' ? 12 : tf === 'W' ? 8 : tf === 'M' ? 18 : 22;

  return {
    peakHours, waitTime,
    storePerfData, top5, bottom5, storeDemoPerf, top5Max,
    indiaWalkin, regionCompare,
    ageGroupTime, ageGroupRegional,
    genderTime, genderRegional,
    hmCols, hmData,
    totalFootfall, totalChange,
  };
}

// ── New chart data ────────────────────────────────────────────────────────────
const INDIA_WALKIN_HOURLY = [
  { h: '8am',  walkins: 120, prev: 95  }, { h: '9am',  walkins: 285, prev: 240 },
  { h: '10am', walkins: 420, prev: 380 }, { h: '11am', walkins: 510, prev: 465 },
  { h: '12pm', walkins: 580, prev: 530 }, { h: '1pm',  walkins: 640, prev: 590 },
  { h: '2pm',  walkins: 600, prev: 555 }, { h: '3pm',  walkins: 540, prev: 505 },
  { h: '4pm',  walkins: 475, prev: 440 }, { h: '5pm',  walkins: 510, prev: 470 },
  { h: '6pm',  walkins: 490, prev: 455 }, { h: '7pm',  walkins: 380, prev: 345 },
];

const REGION_COMPARE_DATA = [
  { region: 'North',   lastYear: 18200, thisYear: 21500 },
  { region: 'South',   lastYear: 24100, thisYear: 29300 },
  { region: 'East',    lastYear: 14800, thisYear: 17200 },
  { region: 'West',    lastYear: 22300, thisYear: 26800 },
  { region: 'Central', lastYear: 10900, thisYear: 12900 },
];

const AGE_GROUP_HOURLY = [
  { h: '8am',  kids: 18,  teens: 28,  youths: 48,  mature: 26  },
  { h: '9am',  kids: 32,  teens: 55,  youths: 120, mature: 78  },
  { h: '10am', kids: 45,  teens: 82,  youths: 185, mature: 108 },
  { h: '11am', kids: 55,  teens: 95,  youths: 225, mature: 135 },
  { h: '12pm', kids: 65,  teens: 110, youths: 260, mature: 145 },
  { h: '1pm',  kids: 70,  teens: 125, youths: 290, mature: 155 },
  { h: '2pm',  kids: 62,  teens: 115, youths: 272, mature: 151 },
  { h: '3pm',  kids: 58,  teens: 102, youths: 245, mature: 135 },
  { h: '4pm',  kids: 50,  teens: 92,  youths: 215, mature: 118 },
  { h: '5pm',  kids: 55,  teens: 98,  youths: 228, mature: 129 },
  { h: '6pm',  kids: 48,  teens: 88,  youths: 218, mature: 136 },
  { h: '7pm',  kids: 38,  teens: 68,  youths: 168, mature: 106 },
];

const AGE_GROUP_REGIONAL = [
  { region: 'North',   kids: 1240, teens: 2180, youths: 4920, mature: 3660 },
  { region: 'South',   kids: 1680, teens: 2940, youths: 6620, mature: 4960 },
  { region: 'East',    kids: 980,  teens: 1720, youths: 3880, mature: 2920 },
  { region: 'West',    kids: 1420, teens: 2480, youths: 5600, mature: 4200 },
  { region: 'Central', kids: 760,  teens: 1340, youths: 3020, mature: 2260 },
];

const GENDER_HOURLY = [
  { h: '8am',  male: 65,  female: 55  }, { h: '9am',  male: 148, female: 137 },
  { h: '10am', male: 218, female: 202 }, { h: '11am', male: 264, female: 246 },
  { h: '12pm', male: 298, female: 282 }, { h: '1pm',  male: 328, female: 312 },
  { h: '2pm',  male: 310, female: 290 }, { h: '3pm',  male: 278, female: 262 },
  { h: '4pm',  male: 245, female: 230 }, { h: '5pm',  male: 262, female: 248 },
  { h: '6pm',  male: 252, female: 238 }, { h: '7pm',  male: 195, female: 185 },
];

const GENDER_REGIONAL = [
  { region: 'North',   male: 10800, female: 10700 },
  { region: 'South',   male: 14600, female: 14700 },
  { region: 'East',    male: 8560,  female: 8640  },
  { region: 'West',    male: 13200, female: 13600 },
  { region: 'Central', male: 6420,  female: 6480  },
];

const HEATMAP_TREEMAP_DATA = [
  { name: 'Maharashtra', value: 28500, pct: 23.1, stores: 12, fill: '#1E3A8A' },
  { name: 'Delhi NCR',   value: 24200, pct: 19.6, stores: 10, fill: '#1D4ED8' },
  { name: 'Karnataka',   value: 18100, pct: 14.7, stores: 8,  fill: '#0369A1' },
  { name: 'Tamil Nadu',  value: 15800, pct: 12.8, stores: 7,  fill: '#0F766E' },
  { name: 'Gujarat',     value: 12400, pct: 10.1, stores: 5,  fill: '#15803D' },
  { name: 'Rajasthan',   value: 9600,  pct: 7.8,  stores: 4,  fill: '#B45309' },
  { name: 'Punjab',      value: 7200,  pct: 5.8,  stores: 3,  fill: '#7C3AED' },
  { name: 'Others',      value: 7500,  pct: 6.1,  stores: 5,  fill: '#374151' },
];

const GENDER_PIE_DATA = [
  { name: 'Male',   value: 42, color: '#3B82F6' },
  { name: 'Female', value: 48, color: '#EC4899' },
  { name: 'Other',  value: 10, color: '#8B5CF6' },
];

const AGE_RANGE_PIE_DATA = [
  { name: 'Kids 0–12',   value: 12, color: '#93C5FD' },
  { name: 'Teens 13–21', value: 6,  color: '#A78BFA' },
  { name: 'Youths 22–35',value: 40, color: '#3B82F6' },
  { name: 'Mature 35+',  value: 42, color: '#1D4ED8' },
];

const STORE_DEMO_PERF = [
  { store: 'Marina Bay Sands', visitors: 15234, kids: 8,  teens: 15, youths: 44, mature: 33 },
  { store: 'Orchard Central',  visitors: 12450, kids: 7,  teens: 14, youths: 46, mature: 33 },
  { store: 'VivoCity',         visitors: 11800, kids: 9,  teens: 16, youths: 42, mature: 33 },
  { store: 'Bugis Junction',   visitors: 10200, kids: 10, teens: 17, youths: 40, mature: 33 },
  { store: 'Tampines Mall',    visitors: 9600,  kids: 12, teens: 18, youths: 38, mature: 32 },
];

const STORE_ASSIST_DATA = [
  { store: 'MBS', s10: 42, s30: 24, s60: 18, s120: 10, unattended: 6 },
  { store: 'OC',  s10: 38, s30: 22, s60: 20, s120: 12, unattended: 8 },
  { store: 'VVC', s10: 44, s30: 20, s60: 16, s120: 11, unattended: 9 },
  { store: 'BJ',  s10: 36, s30: 26, s60: 22, s120: 9,  unattended: 7 },
  { store: 'TM',  s10: 40, s30: 23, s60: 19, s120: 11, unattended: 7 },
];

const TOP5_STORES = [
  { store: 'Marina Bay Sands', visitors: 15234 },
  { store: 'Orchard Central',  visitors: 12450 },
  { store: 'VivoCity',         visitors: 11800 },
  { store: 'Bugis Junction',   visitors: 10200 },
  { store: 'Tampines Mall',    visitors: 9600  },
];

const BOTTOM5_STORES = [
  { store: 'Causeway Point',  visitors: 6900 },
  { store: 'Clementi Mall',   visitors: 4800 },
  { store: 'Bishan Junction', visitors: 5200 },
  { store: 'Jurong Point',    visitors: 8900 },
  { store: 'Northpoint City', visitors: 7800 },
];

// ── SKILL.md chart tokens ─────────────────────────────────────────────────────
const CHART_COLORS = {
  series: ['var(--chart-1)', '#00CE9C', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'],
  male:   '#3B82F6',
  female: '#EC4899',
  highlight: 'var(--color-primary)',
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
const AGE_GROUP_COLORS = ['var(--chart-6)', 'var(--chart-5)', 'var(--chart-6)', 'var(--chart-1)', 'var(--chart-1)'];

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
  overall_footfall_trends: {
    title: 'Overall Footfall Trends',
    description: 'Compares Pan India walk-in totals (current vs previous period) alongside location-wise performance across all regions.',
    calculation: 'Walk-in totals aggregated from all entrance cameras across all regions, compared against the same period last year.',
  },
  footfall_age_groups: {
    title: 'Footfall by Age Groups',
    description: 'Shows visitor distribution across Kids (3–12), Teens (13–21), Youths (22–35), and Mature (35+) age groups by hour and by region.',
    calculation: 'AI age classification per entry event grouped into 4 bands, aggregated hourly (left panel) and by region (right panel).',
  },
  footfall_gender: {
    title: 'Footfall by Gender',
    description: 'Male vs Female visitor traffic split by hour of day and by region. Helps identify which segments drive traffic at specific times.',
    calculation: 'Gender inference from AI vision model per entry event, aggregated hourly and by geographic region.',
  },
  footfall_heatmap: {
    title: 'Regional Footfall Heatmap',
    description: 'Treemap showing relative visitor volume by region/state. Larger, darker tiles represent regions with more visitors.',
    calculation: 'Total entry events per region during the selected period, sized proportionally to each region\'s share of total footfall.',
  },
  demographics_breakdown: {
    title: 'Demographics Breakdown',
    description: 'Side-by-side pie charts showing overall gender distribution and age range distribution across all visitors.',
    calculation: 'AI classification model output per entry event, aggregated across all stores for the selected period.',
  },
  store_performance_footfall: {
    title: 'Store Performance by Footfall',
    description: 'Left: store rankings with segmented demographic bars. Right: staff assist effectiveness by time-on-floor bucket per store.',
    calculation: 'Footfall from entry events per store. Assist data from staff interaction events classified by engagement duration.',
  },
  store_performance_overall: {
    title: 'Store Performance Overview',
    description: 'Quick comparison of Top 5 and Bottom 5 performing stores by total visitor count for the selected period.',
    calculation: 'Entry events per store location sorted highest (top 5) and lowest (bottom 5). Progress bars are relative to the top performer.',
  },
  india_walkin_chart: {
    title: 'Pan India Walk-in Traffic',
    description: 'Compares hourly walk-in counts for the current period against the equivalent previous period. Useful for spotting day-over-day or week-over-week shifts in traffic momentum.',
    calculation: 'Entry events aggregated into hourly buckets across all active entrance cameras. The comparison line uses the same hour range from the prior equivalent period.',
  },
  region_compare_chart: {
    title: 'Region Walk-in Comparison',
    description: 'Side-by-side view of total walk-in volume per region for this year versus last year. Highlights which regions are growing, flat, or declining.',
    calculation: 'Total entry events per geographic region for the current year vs the same period in the prior year. Values are sourced from camera clusters assigned to each region.',
  },
  age_grp_hourly: {
    title: 'Age Groups by Hour',
    description: 'Stacked bar chart showing how different age segments (Kids, Teens, Youths, Mature) contribute to foot traffic across each hour of the day.',
    calculation: 'AI age classification per entry event, grouped into 4 bands and aggregated into 1-hour buckets. Each stack segment represents one age group\'s share of that hour\'s total.',
  },
  age_grp_regional: {
    title: 'Age Groups by Region',
    description: 'Stacked bars comparing the age-group composition of visitors across different store regions. Reveals demographic differences between locations.',
    calculation: 'AI age classification per entry event, aggregated by geographic region. Each segment shows the count or share of that age group within the region\'s total footfall.',
  },
  gender_by_hour: {
    title: 'Gender Traffic by Hour',
    description: 'Male vs female visitor volumes charted hour by hour. Helps identify whether gender balance shifts at certain times of day.',
    calculation: 'Gender inferred by the AI vision model per entry event. Counts are aggregated into 1-hour buckets and plotted as grouped bars for direct comparison.',
  },
  gender_by_region: {
    title: 'Gender Traffic by Region',
    description: 'Compares male and female visitor volumes across store regions. Use this to understand gender-driven differences in location-level footfall.',
    calculation: 'Gender inference from the AI model per entry event, summed by geographic region. Grouped bars show absolute visitor counts for each gender per region.',
  },
  gender_breakdown_pie: {
    title: 'Gender Distribution',
    description: 'Donut chart showing the overall share of male vs female visitors across all stores for the selected period. A quick read on your audience gender split.',
    calculation: 'Total gender-classified entry events divided by overall visitor count, expressed as a percentage. AI confidence threshold of ≥85% applied before classification is counted.',
  },
  age_breakdown_pie: {
    title: 'Age Range Distribution',
    description: 'Donut chart breaking down visitors into age ranges (0–12, 13–21, 22–35, 35+). Shows which age segments make up your core customer base.',
    calculation: 'Total age-classified entry events per bracket divided by overall visitor count. AI confidence threshold of ≥85% applied. Unclassified events are excluded from the total.',
  },
  store_demo_ranking: {
    title: 'Store Demographic Footfall',
    description: 'Ranks store locations by total footfall, with each bar segmented by demographic group. Reveals which stores attract diverse versus concentrated customer segments.',
    calculation: 'Entry events per store, broken down by AI-inferred demographic segment. Segment widths within each bar are proportional to that segment\'s share of the store\'s total visitors.',
  },
  store_staff_assist: {
    title: 'Staff Assist by Store',
    description: 'Tracks staff engagement effectiveness per store using assist duration buckets (brief, moderate, extended). Higher extended-assist shares indicate deeper customer interactions.',
    calculation: 'Assist events are classified by engagement duration captured via staff interaction sensors. Buckets: Brief (<2 min), Moderate (2–5 min), Extended (>5 min). Bars show count per store.',
  },
  top5_performers: {
    title: 'Top 5 Performing Stores',
    description: 'Highlights the five highest-traffic stores for the selected period. Use this to identify best-practice locations and benchmarks for the wider network.',
    calculation: 'Total entry events per store location sorted descending. The top 5 are displayed with progress bars scaled relative to the highest-performing store in the dataset.',
  },
  bottom5_performers: {
    title: 'Bottom 5 Performing Stores',
    description: 'Surfaces the five lowest-traffic stores for the selected period. Useful for identifying underperforming locations that may need operational or marketing attention.',
    calculation: 'Total entry events per store location sorted ascending. The bottom 5 are displayed with progress bars scaled relative to the top performer for proportional context.',
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-surface)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', border: '1px solid var(--color-border)' }}>
      <p style={{ fontSize: 11, color: 'var(--color-text-4)', marginBottom: 5, fontWeight: 600 }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 3 : 0 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{entry.name}</span>
          <span style={{ fontSize: 13, color: 'var(--color-text-1)', fontWeight: 700, marginLeft: 'auto', paddingLeft: 16 }}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const ChartLegend = ({ items }: { items: { color: string; label: string; dash?: boolean }[] }) => (
  <div style={{
    display: 'flex', flexWrap: 'wrap', gap: '6px 24px',
    paddingTop: 10, marginTop: 8,
    borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0,
  }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {item.dash ? (
          <svg width="20" height="10" style={{ flexShrink: 0, display: 'block' }}>
            <line x1="0" y1="5" x2="20" y2="5" stroke={item.color} strokeWidth="2.5" strokeDasharray="5 3" />
          </svg>
        ) : (
          <span style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 12, color: 'var(--color-text-2)', fontWeight: 500 }}>{item.label}</span>
      </div>
    ))}
  </div>
);

// ── Global Legend Table ───────────────────────────────────────────────────────
function GlobalLegend() {
  const trafficItems = [
    { color: 'var(--color-primary)', label: 'Footfall' },
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
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-2)', whiteSpace: 'nowrap', fontWeight: 500 }}>{item.label}</span>
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
      /* margin-top creates the initial gap; it scrolls away so the element sticks flush */
      marginTop: 24,
      /* bleed into container's horizontal padding so it spans full width when stuck */
      marginLeft: -24,
      marginRight: -24,
      marginBottom: 16,
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 28,
      flexWrap: 'wrap',
    }}>
      <Section title="Traffic" items={trafficItems} />
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--color-border-subtle)', flexShrink: 0 }} />
      <Section title="Gender" items={genderItems} />
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--color-border-subtle)', flexShrink: 0 }} />
      <Section title="Demographics (Age × Gender)" items={segmentItems} />
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--color-border-subtle)', flexShrink: 0 }} />
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
          background: 'var(--color-text-3)',
          border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', flexShrink: 0,
          transition: 'background 150ms',
          padding: 0,
        }}
        onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis)'; }}
        onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-text-3)'; }}
      >
        <Info size={12} strokeWidth={2} />
      </button>
      {show && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 272, background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderRadius: 12,
          padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.11)',
          zIndex: 200,
        }}>
          <div style={{
            position: 'absolute', top: -5, right: 8,
            width: 10, height: 10, background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderBottom: 'none', borderRight: 'none',
            transform: 'rotate(45deg)',
          }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 6 }}>{info.title}</p>
          <p style={{ fontSize: 11.5, color: 'var(--color-text-2)', lineHeight: 1.6, marginBottom: 10 }}>{info.description}</p>
          <div style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '8px 10px' }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>How it&apos;s calculated</p>
            <p style={{ fontSize: 11, color: 'var(--color-text-3)', lineHeight: 1.6 }}>{info.calculation}</p>
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
        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text-1)', lineHeight: 1.1 }}>{value}{suffix}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 3 }}>{label}</div>
      </div>
      <div style={{ flex: 1, minHeight: 60 }}>
        <Sparkline data={data} color={color} h={70} />
      </div>
    </div>
  );
}

// ── Widget accent colours (module-level so the chip strip can use them too) ───
const WIDGET_ACCENT: Record<string, string> = {
  footfall_trend: 'var(--chart-1)', passerby_trend: 'var(--chart-2)', peak_hours: 'var(--chart-1)',
  conversion_rate: 'var(--chart-3)', demographics_donut: 'var(--chart-1)', gender_trend: 'var(--chart-4)',
  age_bar: 'var(--chart-5)', queue_length: 'var(--color-error)', wait_time: 'var(--color-warning)',
  top_stores: 'var(--chart-4)', store_conversion: 'var(--chart-1)', store_heatmap: 'var(--chart-6)',
  overall_footfall_trends: 'var(--chart-1)', footfall_age_groups: 'var(--chart-3)',
  footfall_gender: 'var(--chart-4)', footfall_heatmap: 'var(--chart-6)',
  demographics_breakdown: 'var(--chart-5)', store_performance_footfall: 'var(--chart-2)',
  store_performance_overall: 'var(--chart-4)',
  india_walkin_chart: 'var(--chart-1)', region_compare_chart: 'var(--chart-6)',
  age_grp_hourly: 'var(--chart-3)', age_grp_regional: 'var(--chart-3)',
  gender_by_hour: 'var(--chart-4)', gender_by_region: 'var(--chart-4)',
  gender_breakdown_pie: 'var(--chart-4)', age_breakdown_pie: 'var(--chart-4)',
  store_demo_ranking: 'var(--chart-2)', store_staff_assist: 'var(--chart-1)',
  top5_performers: 'var(--chart-2)', bottom5_performers: 'var(--color-error)',
};

// ── Chart height overrides for tall/complex widgets ───────────────────────────
const WIDGET_HEIGHTS: Record<string, number> = {
  overall_footfall_trends: 360,
  footfall_age_groups: 360,
  footfall_gender: 300,
  footfall_heatmap: 300,
  demographics_breakdown: 280,
  store_performance_footfall: 320,
  store_performance_overall: 260,
};

// ── Widgets that should span both grid columns ────────────────────────────────
const FULL_WIDTH_IDS = new Set([
  'footfall_heatmap',
]);

// ── Widget renderer ───────────────────────────────────────────────────────────
function PlacedWidget({
  widgetId,
  onRemove,
  editMode = false,
  dragIndex,
  onDragStart,
  onDragEnter,
  onDragEnd,
  timeframe = 'M',
  autoOpenSnapshots = false,
}: {
  widgetId: string;
  onRemove: () => void;
  editMode?: boolean;
  dragIndex?: number;
  onDragStart?: (i: number) => void;
  onDragEnter?: (i: number) => void;
  onDragEnd?: () => void;
  timeframe?: Timeframe;
  autoOpenSnapshots?: boolean;
}) {
  // All hooks must be unconditional — early return comes AFTER
  const color = WIDGET_ACCENT[widgetId] ?? 'var(--chart-1)';
  const [showSnapshots, setShowSnapshots] = useState(false);

  // Auto-open snapshots when triggered from Quick Actions
  useEffect(() => {
    if (autoOpenSnapshots) setShowSnapshots(true);
  }, [autoOpenSnapshots]);
  // Snapshot modal controls (lifted from VisitorSnapshots when modal is open)
  const [snapEventFilter, setSnapEventFilter] = useState<'all' | 'entry' | 'exit' | 'passerby'>('all');
  const [snapRefreshing, setSnapRefreshing] = useState(false);
  const [snapShowInfo, setSnapShowInfo] = useState(false);
  const handleSnapRefresh = () => {
    if (snapRefreshing) return;
    setSnapRefreshing(true);
    setTimeout(() => setSnapRefreshing(false), 900);
  };

  // Smooth height animation for the snapshot content area (FLIP technique)
  const snapBodyRef = useRef<HTMLDivElement>(null);
  const isFirstSnapFilter = useRef(true);

  // Reset "first render" flag each time the modal opens so no ghost animation on first open
  useEffect(() => {
    if (showSnapshots) isFirstSnapFilter.current = true;
  }, [showSnapshots]);

  // After React re-renders with the new filter's cards, animate from frozen → natural height
  useEffect(() => {
    if (isFirstSnapFilter.current) {
      isFirstSnapFilter.current = false;
      // changeSnapFilter may have already frozen the height before this first render;
      // release it immediately so content is never clipped on the first switch after reopen
      const el = snapBodyRef.current;
      if (el) { el.style.height = 'auto'; el.style.overflow = ''; el.style.transition = ''; }
      return;
    }
    const el = snapBodyRef.current;
    if (!el) return;
    const frozenH = el.style.height; // set by changeSnapFilter before state update
    el.style.overflow = 'hidden';     // prevent scrollbar flash during resize
    el.style.transition = 'none';
    el.style.height = 'auto';
    const newH = el.scrollHeight;
    el.style.height = frozenH;          // restore frozen — no visible jump
    void el.offsetHeight;               // force reflow
    el.style.transition = 'height 320ms cubic-bezier(0.4, 0, 0.2, 1)';
    el.style.height = newH + 'px';
    const t = setTimeout(() => {
      el.style.height = 'auto';
      el.style.transition = '';
      el.style.overflow = '';           // restore overflow-y: auto from JSX style
    }, 320);
    return () => clearTimeout(t);
  }, [snapEventFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Freeze current height right before the state update so the transition has a start point
  const changeSnapFilter = (f: 'all' | 'entry' | 'exit' | 'passerby') => {
    const el = snapBodyRef.current;
    if (el) { el.style.transition = 'none'; el.style.height = el.scrollHeight + 'px'; }
    setSnapEventFilter(f);
  };
  const [genderFilter, setGenderFilter] = useState('All');
  const [agGenderFilter, setAgGenderFilter] = useState('All');
  const [ageGrpFilter, setAgeGrpFilter] = useState('All');

  const def = ALL_WIDGETS.find(w => w.id === widgetId);
  if (!def) return null;

  function renderChart() {
    const tfData = getTfData(timeframe);
    const cd = getChartData(timeframe);
    switch (widgetId) {
      case 'footfall_trend':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width={700} height="100%">
                <BarChart data={tfData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }} barCategoryGap="35%">
                  <defs>
                    <linearGradient id="ffGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-6)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="ffGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={1} />
                      <stop offset="100%" stopColor="#00CE9C" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} tickFormatter={(v: any) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
                  <Bar dataKey="footfall" name="Footfall" fill="url(#ffGrad1)" radius={[6,6,0,0]} />
                  <Bar dataKey="passerby" name="Passerby" fill="url(#ffGrad2)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'passerby_trend': {
        const passData = tfData.map(d => ({ ...d, prev: Math.round(d.passerby * 0.88) }));
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width={700} height="100%">
                <AreaChart data={passData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pbGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00CE9C" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#00CE9C" stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="pbGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.14} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="passerby" name="This month" stroke="#00CE9C" strokeWidth={2.5} fill="url(#pbGrad1)" dot={false} activeDot={{ r: 5, fill: '#00CE9C', stroke: '#fff', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="prev" name="Prev month" stroke="var(--chart-1)" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#pbGrad2)" dot={false} activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case 'conversion_rate': {
        const convData = tfData.map(d => ({ ...d, target: 15 }));
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width={700} height="100%">
                <ComposedChart data={convData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B45309" stopOpacity={1} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} tickFormatter={(v: any) => `${v}%`} domain={[0, 20]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,158,11,0.06)' }} />
                  <Bar dataKey="conv" name="Conversion %" fill="url(#convGrad)" radius={[6,6,0,0]} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="var(--chart-1)" strokeWidth={1.5} strokeDasharray="6 3" dot={false} activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: '#fff', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case 'wait_time': {
        return (
          <ResponsiveContainer width={650} height="100%">
            <AreaChart data={cd.waitTime} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#D97706" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} tickFormatter={(v: any) => `${v}m`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="wait" name="Avg wait" stroke="#D97706" strokeWidth={2.5} fill="url(#wtGrad)" dot={false} activeDot={{ r: 5, fill: '#D97706', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        );
      }

      case 'peak_hours': {
        const peakMax = Math.max(...cd.peakHours.map((d: any) => d.v));
        return (
          <ResponsiveContainer width={650} height="100%">
            <BarChart data={cd.peakHours} margin={{ top: 8, right: 0, left: -20, bottom: 0 }} barCategoryGap="35%">
              <defs>
                <linearGradient id="peakHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-6)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
              <Bar dataKey="v" name="Visitors" radius={[6,6,0,0]}>
                {cd.peakHours.map((d: any, i: number) => (
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
                  <span style={{ fontSize: 11.5, color: 'var(--color-text-2)', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-1)', marginLeft: 'auto', paddingLeft: 8 }}>{d.value}%</span>
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
                <LineChart data={tfData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
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
          <text x={x + width + 8} y={y + height / 2 + 1} fill="var(--color-text-2)" fontSize={12} fontWeight={600} dominantBaseline="middle">{value}%</text>
        );
        const ageBarData = AGE_DATA.map(d => ({ ...d, value: d.pct }));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageBarData} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barCategoryGap="30%">
              <XAxis type="number" hide />
              <YAxis dataKey="group" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-2)', fontSize: 12, fontWeight: 500 }} width={50} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
              <Bar dataKey="value" radius={[0,6,6,0]} label={<CustomLabel />}>
                {ageBarData.map((_, i) => <Cell key={i} fill={AGE_GROUP_COLORS[i % AGE_GROUP_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'queue_length': {
        const maxQ = Math.max(...cd.peakHours.map((d: any) => d.q));
        return (
          <ResponsiveContainer width={650} height="100%">
            <BarChart data={cd.peakHours} margin={{ top: 8, right: 0, left: -20, bottom: 0 }} barCategoryGap="35%">
              <defs>
                <linearGradient id="queueHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-6)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
              <Bar dataKey="q" name="Queue depth" radius={[6,6,0,0]}>
                {cd.peakHours.map((d: any, i: number) => (
                  <Cell key={i} fill={d.q === maxQ ? 'url(#queueHigh)' : CHART_COLORS.muted} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'top_stores': {
        const spMax = cd.storePerfData[0]?.v || 1;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            {cd.storePerfData.map((s: any, i: number) => (
              <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < cd.storePerfData.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-4)', width: 16, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-2)', width: 148, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store}</span>
                <div style={{ flex: 1, minWidth: 0, height: 6, background: 'var(--color-surface-2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${(s.v / spMax) * 100}%`, backgroundColor: 'var(--color-primary)' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', width: 48, textAlign: 'right', flexShrink: 0 }}>
                  {s.v >= 1000 ? (s.v / 1000).toFixed(1) + 'K' : s.v}
                </span>
              </div>
            ))}
          </div>
        );
      }

      case 'store_conversion':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            {cd.storePerfData.map((s: any, i: number) => (
              <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < cd.storePerfData.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-2)', width: 148, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store}</span>
                <div style={{ flex: 1, minWidth: 0, height: 6, background: 'var(--color-surface-2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${(s.conv / 20) * 100}%`, backgroundColor: '#754C7F' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', width: 48, textAlign: 'right', flexShrink: 0 }}>{s.conv}%</span>
              </div>
            ))}
          </div>
        );

      case 'store_heatmap': {
        const HEATMAP_COLORS = [
          { min: 0,  max: 20,  bg: 'var(--color-heatmap-low)', text: 'var(--color-primary)' },
          { min: 20, max: 40,  bg: '#DDD6FF', text: '#5549C0' },
          { min: 40, max: 60,  bg: '#C4B5FD', text: '#4A3FAD' },
          { min: 60, max: 80,  bg: '#A78BFA', text: '#fff' },
          { min: 80, max: 100, bg: 'var(--color-primary)', text: '#fff' },
        ];
        const getHeatColor = (val: number) =>
          HEATMAP_COLORS.find(c => val >= c.min && val < c.max) ?? HEATMAP_COLORS[0];
        const hmRows = ['Ent A', 'Ent B', 'L1', 'L2', 'L3'];
        const hmCols = cd.hmCols;
        const hmData = cd.hmData;
        return (
          <div style={{ overflowX: 'auto', height: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ width: 48, textAlign: 'left', color: 'var(--color-text-3)', fontWeight: 500, paddingBottom: 6 }} />
                  {hmCols.map(col => (
                    <th key={col} style={{ textAlign: 'center', color: 'var(--color-text-3)', fontWeight: 500, paddingBottom: 6, paddingLeft: 4, paddingRight: 4 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hmRows.map((row, ri) => (
                  <tr key={row}>
                    <td style={{ color: 'var(--color-text-2)', fontWeight: 500, paddingRight: 6, paddingTop: 3, paddingBottom: 3, whiteSpace: 'nowrap' }}>{row}</td>
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

      case 'overall_footfall_trends': {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-1)' }}>{cd.totalFootfall}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 6 }}>▲ {cd.totalChange}% vs Last Period</span>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Gender:</span>
                <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-2)', cursor: 'pointer' }}>
                  <option>All</option><option>Male</option><option>Female</option>
                </select>
              </div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, flexShrink: 0 }}>Pan India Walk-in Traffic</p>
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cd.indiaWalkin} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.06)' }} />
                      <Bar dataKey="walkins" name="Walk-ins" fill="var(--chart-1)" radius={[4,4,0,0]} fillOpacity={0.88} />
                      <Line type="monotone" dataKey="prev" name="Previous Period" stroke="#00CE9C" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00CE9C', stroke: '#fff', strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, flexShrink: 0 }}>Location Wise Walk-in Traffic (Regions)</p>
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cd.regionCompare} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={4} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.04)' }} />
                      <Bar dataKey="lastYear" name="Last Year" fill="#A78BFA" radius={[4,4,0,0]} />
                      <Bar dataKey="thisYear" name="This Year" fill="var(--chart-1)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, paddingTop: 6, borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
              {[['Walk-ins', 'var(--chart-1)'], ['Previous Period', '#00CE9C'], ['Last Year', '#A78BFA'], ['This Year', 'var(--chart-1)']].map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, color: 'var(--color-text-3)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'footfall_age_groups': {
        const AGE_COLORS = { kids: '#F59E0B', teens: 'var(--color-primary)', youths: '#00CE9C', mature: '#EC4899' };
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 500 }}>Filter by Gender:</span>
              <select value={agGenderFilter} onChange={e => setAgGenderFilter(e.target.value)} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-2)' }}>
                <option>All</option><option>Male</option><option>Female</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, flexShrink: 0 }}>Pan India Walk-in Age-Group Traffic</p>
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cd.ageGroupTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="kids"   name="Kids 3–12"    stackId="a" fill={AGE_COLORS.kids} />
                      <Bar dataKey="teens"  name="Teens 13–21"  stackId="a" fill={AGE_COLORS.teens} />
                      <Bar dataKey="youths" name="Youths 22–35" stackId="a" fill={AGE_COLORS.youths} />
                      <Bar dataKey="mature" name="Mature 35+"   stackId="a" fill={AGE_COLORS.mature} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, flexShrink: 0 }}>Location Wise Walk-in Age-Group Traffic (Regions)</p>
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cd.ageGroupRegional} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="kids"   name="Kids 3–12"    stackId="a" fill={AGE_COLORS.kids} />
                      <Bar dataKey="teens"  name="Teens 13–21"  stackId="a" fill={AGE_COLORS.teens} />
                      <Bar dataKey="youths" name="Youths 22–35" stackId="a" fill={AGE_COLORS.youths} />
                      <Bar dataKey="mature" name="Mature 35+"   stackId="a" fill={AGE_COLORS.mature} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, paddingTop: 6, borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
              {([['Kids 3–12', AGE_COLORS.kids], ['Teens 13–21', AGE_COLORS.teens], ['Youths 22–35', AGE_COLORS.youths], ['Mature 35+', AGE_COLORS.mature]] as [string, string][]).map(([label, c]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, color: 'var(--color-text-3)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'footfall_gender': {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 500 }}>Filter by Age Group:</span>
              <select value={ageGrpFilter} onChange={e => setAgeGrpFilter(e.target.value)} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-2)' }}>
                <option>All</option><option>Kids 3–12</option><option>Teens 13–21</option><option>Youths 22–35</option><option>Mature 35+</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, flexShrink: 0 }}>Pan India Walk-in Gender Traffic</p>
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cd.genderTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={3} barCategoryGap="28%">
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="male"   name="Male"   fill="#3B82F6" radius={[4,4,0,0]} />
                      <Bar dataKey="female" name="Female" fill="#EC4899" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, flexShrink: 0 }}>Location Wise Walk-in Gender Traffic (Regions)</p>
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cd.genderRegional} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={4} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="male"   name="Male"   fill="#3B82F6" radius={[4,4,0,0]} />
                      <Bar dataKey="female" name="Female" fill="#EC4899" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, paddingTop: 6, borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
              {[['Male', '#3B82F6'], ['Female', '#EC4899']].map(([label, c]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, color: 'var(--color-text-3)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'footfall_heatmap': {
        const TreemapContent = ({ x, y, width, height, name, pct, stores, value: cellValue, fill: cellFill }: any) => {
          if (!width || !height || width < 10 || height < 10) return null;
          return (
            <g>
              <rect x={x} y={y} width={width} height={height} style={{ fill: cellFill ?? '#1D4ED8', stroke: '#fff', strokeWidth: 2.5 }} rx={6} />
              {width > 50 && height > 32 && (
                <>
                  <text x={x + 10} y={y + 22} fill="#fff" fontSize={13} fontWeight={700}>{name}</text>
                  {height > 50 && <text x={x + 10} y={y + 38} fill="rgba(255,255,255,0.85)" fontSize={11.5}>{pct}% · {stores} stores</text>}
                  {height > 68 && <text x={x + 10} y={y + 54} fill="rgba(255,255,255,0.7)" fontSize={11}>{typeof cellValue === 'number' ? cellValue.toLocaleString() : ''} visitors</text>}
                </>
              )}
            </g>
          );
        };
        return (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={HEATMAP_TREEMAP_DATA}
              dataKey="value"
              aspectRatio={4 / 3}
              content={<TreemapContent />}
            />
          </ResponsiveContainer>
        );
      }

      case 'demographics_breakdown':
        return (
          <div style={{ display: 'flex', height: '100%', gap: 24 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 8, flexShrink: 0 }}>Gender Breakdown</p>
              <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={GENDER_PIE_DATA} cx="50%" cy="50%" innerRadius="35%" outerRadius="60%" dataKey="value" paddingAngle={3}>
                      {GENDER_PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', gap: 12, flexShrink: 0, marginTop: 6 }}>
                {GENDER_PIE_DATA.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{d.name} ({d.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--color-surface-2)', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 8, flexShrink: 0 }}>Age Range Breakdown</p>
              <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={AGE_RANGE_PIE_DATA} cx="50%" cy="50%" innerRadius="35%" outerRadius="60%" dataKey="value" paddingAngle={3}>
                      {AGE_RANGE_PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', flexShrink: 0, marginTop: 6, justifyContent: 'center' }}>
                {AGE_RANGE_PIE_DATA.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{d.name} ({d.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'store_performance_footfall': {
        const ASSIST_COLORS = ['var(--chart-1)', 'var(--chart-6)', 'var(--chart-5)', 'var(--chart-6)', 'var(--color-border)'];
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 10, flexShrink: 0 }}>Store Performance by Footfall</p>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {cd.storeDemoPerf.map((s: any, i: number) => (
                  <div key={s.store} style={{ padding: '6px 0', borderBottom: i < cd.storeDemoPerf.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.store}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', flexShrink: 0, marginLeft: 8 }}>{(s.visitors/1000).toFixed(1)}K</span>
                    </div>
                    <div style={{ display: 'flex', height: 7, borderRadius: 99, overflow: 'hidden' }}>

                      <div style={{ width: `${s.kids}%`,   background: '#F59E0B' }} />
                      <div style={{ width: `${s.teens}%`,  background: 'var(--color-primary-emphasis)' }} />
                      <div style={{ width: `${s.youths}%`, background: '#00CE9C' }} />
                      <div style={{ width: `${s.mature}%`, background: '#EC4899' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 10, flexShrink: 0 }}>Store Performance by Assist</p>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={STORE_ASSIST_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="22%">
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="store" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="s10"        name="0–10s"       stackId="a" fill={ASSIST_COLORS[0]} />
                    <Bar dataKey="s30"        name="11–30s"      stackId="a" fill={ASSIST_COLORS[1]} />
                    <Bar dataKey="s60"        name="31–59s"      stackId="a" fill={ASSIST_COLORS[2]} />
                    <Bar dataKey="s120"       name="1–2min"      stackId="a" fill={ASSIST_COLORS[3]} />
                    <Bar dataKey="unattended" name="Unattended"  stackId="a" fill={ASSIST_COLORS[4]} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 6, borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0, flexWrap: 'wrap' }}>
                {(['0–10s','11–30s','31–59s','1–2min','Unattended'] as const).map((label, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: ASSIST_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'store_performance_overall':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: '100%' }}>
            <div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 10px', borderRadius: 20 }}>▲ Top 5 Stores</span>
              </div>
              {cd.top5.map((s: any, i: number) => (
                <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < cd.top5.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-4)', width: 14, flexShrink: 0 }}>{i+1}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store}</span>
                  <div style={{ width: 70, height: 5, background: 'var(--color-surface-2)', borderRadius: 99, flexShrink: 0 }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${(s.visitors / cd.top5Max) * 100}%`, background: '#00CE9C' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', width: 38, textAlign: 'right', flexShrink: 0 }}>{s.visitors >= 1000 ? (s.visitors/1000).toFixed(1) + 'K' : s.visitors}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: 20 }}>▼ Bottom 5 Stores</span>
              </div>
              {cd.bottom5.map((s: any, i: number) => (
                <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < cd.bottom5.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-4)', width: 14, flexShrink: 0 }}>{i+1}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store}</span>
                  <div style={{ width: 70, height: 5, background: 'var(--color-surface-2)', borderRadius: 99, flexShrink: 0 }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${(s.visitors / cd.top5Max) * 100}%`, background: '#EF4444' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', width: 38, textAlign: 'right', flexShrink: 0 }}>{s.visitors >= 1000 ? (s.visitors/1000).toFixed(1) + 'K' : s.visitors}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'india_walkin_chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cd.indiaWalkin} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="iwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-6)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.05)' }} />
              <Bar dataKey="walkins" name="Walk-ins" fill="url(#iwGrad)" radius={[6,6,0,0]} />
              <Line type="monotone" dataKey="prev" name="Previous Period" stroke="#00CE9C" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#00CE9C', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'region_compare_chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cd.regionCompare} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={4} barCategoryGap="30%">
              <defs>
                <linearGradient id="rcLY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-6)" stopOpacity={1} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="rcTY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4C1D95" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(101,91,211,0.04)' }} />
              <Bar dataKey="lastYear" name="Last Year" fill="url(#rcLY)" radius={[6,6,0,0]} />
              <Bar dataKey="thisYear" name="This Year" fill="url(#rcTY)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'age_grp_hourly': {
        const AGE_C = { kids: '#F59E0B', teens: 'var(--color-primary)', youths: '#00CE9C', mature: '#EC4899' };
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cd.ageGroupTime} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="kids"   name="Kids 3–12"    stackId="a" fill={AGE_C.kids} />
              <Bar dataKey="teens"  name="Teens 13–21"  stackId="a" fill={AGE_C.teens} />
              <Bar dataKey="youths" name="Youths 22–35" stackId="a" fill={AGE_C.youths} />
              <Bar dataKey="mature" name="Mature 35+"   stackId="a" fill={AGE_C.mature} radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'age_grp_regional': {
        const AGE_C2 = { kids: '#F59E0B', teens: 'var(--color-primary)', youths: '#00CE9C', mature: '#EC4899' };
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cd.ageGroupRegional} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="kids"   name="Kids 3–12"    stackId="a" fill={AGE_C2.kids} />
              <Bar dataKey="teens"  name="Teens 13–21"  stackId="a" fill={AGE_C2.teens} />
              <Bar dataKey="youths" name="Youths 22–35" stackId="a" fill={AGE_C2.youths} />
              <Bar dataKey="mature" name="Mature 35+"   stackId="a" fill={AGE_C2.mature} radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'gender_by_hour':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cd.genderTime} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={3} barCategoryGap="28%">
              <defs>
                <linearGradient id="ghmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D4ED8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="ghfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BE185D" stopOpacity={1} />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="male"   name="Male"   fill="url(#ghmGrad)" radius={[5,5,0,0]} />
              <Bar dataKey="female" name="Female" fill="url(#ghfGrad)" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'gender_by_region':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cd.genderRegional} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={4} barCategoryGap="30%">
              <defs>
                <linearGradient id="grmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D4ED8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="grfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BE185D" stopOpacity={1} />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} tickFormatter={(v: any) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="male"   name="Male"   fill="url(#grmGrad)" radius={[5,5,0,0]} />
              <Bar dataKey="female" name="Female" fill="url(#grfGrad)" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'gender_breakdown_pie':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
            <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={GENDER_PIE_DATA} cx="50%" cy="50%" innerRadius="35%" outerRadius="65%" dataKey="value" paddingAngle={3}>
                    {GENDER_PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: 16, flexShrink: 0, paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)', width: '100%', justifyContent: 'center' }}>
              {GENDER_PIE_DATA.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-2)', fontWeight: 500 }}>{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'age_breakdown_pie':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
            <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={AGE_RANGE_PIE_DATA} cx="50%" cy="50%" innerRadius="35%" outerRadius="65%" dataKey="value" paddingAngle={3}>
                    {AGE_RANGE_PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', flexShrink: 0, paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)', width: '100%', justifyContent: 'center' }}>
              {AGE_RANGE_PIE_DATA.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-2)', fontWeight: 500 }}>{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'store_demo_ranking':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            {cd.storeDemoPerf.map((s: any, i: number) => (
              <div key={s.store} style={{ padding: '6px 0', borderBottom: i < cd.storeDemoPerf.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.store}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', flexShrink: 0, marginLeft: 8 }}>{(s.visitors/1000).toFixed(1)}K</span>
                </div>
                <div style={{ display: 'flex', height: 7, borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${s.kids}%`,   background: '#F59E0B' }} />
                  <div style={{ width: `${s.teens}%`,  background: 'var(--color-primary-emphasis)' }} />
                  <div style={{ width: `${s.youths}%`, background: '#00CE9C' }} />
                  <div style={{ width: `${s.mature}%`, background: '#EC4899' }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'store_staff_assist': {
        const ASSIST_C = ['var(--chart-1)', 'var(--chart-6)', 'var(--chart-5)', 'var(--chart-6)', 'var(--color-border)'];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={STORE_ASSIST_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="store" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-3)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="s10"        name="0–10s"      stackId="a" fill={ASSIST_C[0]} />
                  <Bar dataKey="s30"        name="11–30s"     stackId="a" fill={ASSIST_C[1]} />
                  <Bar dataKey="s60"        name="31–59s"     stackId="a" fill={ASSIST_C[2]} />
                  <Bar dataKey="s120"       name="1–2min"     stackId="a" fill={ASSIST_C[3]} />
                  <Bar dataKey="unattended" name="Unattended" stackId="a" fill={ASSIST_C[4]} radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: '6px 14px', paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0, flexWrap: 'wrap' }}>
              {(['0–10s','11–30s','31–59s','1–2min','Unattended'] as const).map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: ASSIST_C[i], flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, color: 'var(--color-text-2)', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'top5_performers':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            {cd.top5.map((s: any, i: number) => (
              <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < cd.top5.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? '#F59E0B' : 'var(--color-text-4)', width: 18, flexShrink: 0 }}>#{i+1}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-2)', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store}</span>
                <div style={{ flex: 1, minWidth: 0, height: 6, background: 'var(--color-surface-2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${(s.visitors / cd.top5Max) * 100}%`, background: '#00CE9C' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)', width: 44, textAlign: 'right', flexShrink: 0 }}>{(s.visitors/1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        );

      case 'bottom5_performers':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            {cd.bottom5.map((s: any, i: number) => (
              <div key={s.store} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < cd.bottom5.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', width: 18, flexShrink: 0 }}>#{i+1}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-2)', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store}</span>
                <div style={{ flex: 1, minWidth: 0, height: 6, background: 'var(--color-surface-2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${(s.visitors / cd.top5Max) * 100}%`, background: '#EF4444' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)', width: 44, textAlign: 'right', flexShrink: 0 }}>{(s.visitors/1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        );

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
            <GripVertical size={14} strokeWidth={2} style={{ color: 'var(--color-text-4)', marginRight: 4, flexShrink: 0, cursor: 'grab' }} />
          )}
          <span style={{ width: 3, height: 14, borderRadius: 2, background: color, flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)' }}>{def.label}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!editMode && widgetId === 'footfall_trend' && (
            <button
              onClick={() => setShowSnapshots(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', height: 26, borderRadius: 6,
                background: 'transparent', border: '1px solid var(--color-accent-border)',
                color: 'var(--color-primary)', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                transition: 'background 150ms, border-color 150ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-border)'; }}
            >
              <Eye size={12} strokeWidth={1.5} />
              View Snapshots
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
      <div style={{ height: WIDGET_HEIGHTS[widgetId] ?? 180, overflowX: 'auto', overflowY: 'hidden' }}>
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
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '8vh 24px 24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-page-bg)',
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
            {/* Row 1: title header — white bg, bottom border */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 20px',
              background: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
              flexShrink: 0,
            }}>
              <Bell size={14} strokeWidth={2} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-1)' }}>Visitor Snapshots</span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                padding: '2px 7px', borderRadius: 999,
                background: 'rgba(101,91,211,0.1)', color: 'var(--color-primary)',
              }}>Live</span>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setShowSnapshots(false)}
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--color-text-4)', flexShrink: 0,
                  transition: 'background 150ms, border-color 150ms, color 150ms',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = '#FEF2F2';
                  el.style.borderColor = '#FECACA';
                  el.style.color = '#DC2626';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = 'var(--color-surface)';
                  el.style.borderColor = 'var(--color-border)';
                  el.style.color = 'var(--color-text-4)';
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>

            {/* Row 2: filter pills (left) + refresh / divider / info (right) */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '10px 20px',
              background: 'var(--color-surface-2)',
              flexShrink: 0,
            }}>
              {/* Filter pills — left-aligned */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {(['all', 'entry', 'exit', 'passerby'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => changeSnapFilter(f)}
                    style={{
                      height: 28, paddingLeft: 12, paddingRight: 12,
                      borderRadius: 999,
                      border: snapEventFilter === f ? 'none' : '1px solid #E5E7EB',
                      cursor: 'pointer',
                      fontSize: 12, fontWeight: 500,
                      background: snapEventFilter === f ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: snapEventFilter === f ? 'white' : 'var(--color-text-3)',
                      flexShrink: 0,
                      transition: 'background 150ms, color 150ms',
                    }}
                    onMouseEnter={e => {
                      if (snapEventFilter !== f) {
                        (e.currentTarget as HTMLElement).style.background = '#F9F7FF';
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (snapEventFilter !== f) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-text-3)';
                      }
                    }}
                  >
                    {f === 'all' ? 'All Events' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Right controls: Refresh + divider (equal margin) + Info */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Refresh button */}
                <button
                  onClick={handleSnapRefresh}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    height: 28, paddingLeft: 10, paddingRight: 10,
                    borderRadius: 7, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    fontSize: 11, fontWeight: 500, color: 'var(--color-text-3)',
                    cursor: 'pointer', flexShrink: 0,
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9F7FF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                >
                  <RefreshCw
                    size={12} strokeWidth={2.2}
                    style={{ color: 'var(--color-primary)', animation: snapRefreshing ? 'spin 0.9s linear infinite' : 'none' }}
                  />
                  Refresh
                </button>

                {/* Divider — equal 8px gap on both sides */}
                <div style={{ width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0, margin: '0 8px' }} />

                {/* Info button */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button
                    onMouseEnter={() => setSnapShowInfo(true)}
                    onMouseLeave={() => setSnapShowInfo(false)}
                    onFocus={() => setSnapShowInfo(true)}
                    onBlur={() => setSnapShowInfo(false)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, color: 'var(--color-text-4)',
                      transition: 'color 150ms',
                    }}
                  >
                    <Info size={14} strokeWidth={1.8} />
                  </button>
                  {snapShowInfo && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      width: 240, background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)', borderRadius: 10,
                      padding: '12px 14px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                      zIndex: 100,
                    }}>
                      <div style={{ position: 'absolute', top: -5, right: 10, width: 10, height: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderBottom: 'none', borderRight: 'none', transform: 'rotate(45deg)', borderRadius: 2 }} />
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 4 }}>Live Visitor Snapshots</p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-3)', lineHeight: 1.65 }}>
                        Real-time frames captured by entrance cameras each time a visitor is detected. Shows event type, demographic match, and AI confidence score.
                      </p>
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {[
                          { dot: '#16A34A', label: 'Entry — visitor walked in' },
                          { dot: '#DC2626', label: 'Exit — visitor left' },
                          { dot: '#D97706', label: 'Passerby — detected outside' },
                        ].map(({ dot, label }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: 'var(--color-text-2)' }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable snapshots content */}
            <div ref={snapBodyRef} style={{ overflowY: 'auto', padding: '24px 24px' }}>
              <VisitorSnapshots
                hideHeader
                eventFilter={snapEventFilter}
                onEventFilterChange={setSnapEventFilter}
                isRefreshing={snapRefreshing}
                onRefresh={handleSnapRefresh}
                showInfo={snapShowInfo}
                onShowInfoChange={setSnapShowInfo}
              />
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
function AddWidgetsModal({
  onClose,
  onAdd,
  currentWidgets = [],
}: {
  onClose: () => void;
  onAdd: (ids: string[]) => void;
  currentWidgets?: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const groups = Array.from(new Set(ALL_WIDGETS.map(w => w.group)));

  const toggleWidget = (id: string) => {
    if (currentWidgets.includes(id)) return; // already in layout — not toggleable
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    onAdd(Array.from(selected).filter(id => !currentWidgets.includes(id)));
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
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-1)' }}>Add Widgets</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>Select one or more charts to add to this page</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md" style={{ color: 'var(--color-text-4)' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-5">
            {groups.map(group => (
              <div key={group}>
                <p className="text-xs font-bold uppercase mb-2.5" style={{ color: 'var(--color-text-4)', letterSpacing: '0.07em' }}>{group}</p>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_WIDGETS.filter(w => w.group === group).map(widget => {
                    const isAdded = currentWidgets.includes(widget.id);
                    const isSelected = selected.has(widget.id);
                    return (
                      <button
                        key={widget.id}
                        onClick={() => toggleWidget(widget.id)}
                        className="text-left rounded-xl overflow-hidden transition-all"
                        style={{
                          border: `1.5px solid ${isAdded ? '#D1FAE5' : isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: isAdded ? 'var(--color-page-bg)' : 'var(--color-surface)',
                          boxShadow: isSelected && !isAdded ? '0 0 0 3px var(--color-focus-ring)' : 'none',
                          cursor: isAdded ? 'default' : 'pointer',
                        }}
                      >
                        <div style={{
                          background: isAdded ? 'var(--color-surface-2)' : 'var(--color-widget-preview-bg)',
                          borderBottom: `1px solid ${isAdded ? 'var(--color-border)' : isSelected ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                          padding: '12px 12px 8px',
                          pointerEvents: 'none',
                          position: 'relative',
                        }}>
                          {widget.preview}
                          {isAdded && (
                            <div style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              background: '#DCFCE7',
                              color: '#16A34A',
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 99,
                              letterSpacing: '0.02em',
                            }}>
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M1.5 4L3.2 5.7L6.5 2.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Added
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '8px 10px 9px' }}>
                          <p style={{ fontSize: 11.5, fontWeight: 600, color: isAdded ? 'var(--color-text-4)' : isSelected ? 'var(--color-primary)' : 'var(--color-text-1)' }}>{widget.label}</p>
                          <p style={{ fontSize: 10.5, color: 'var(--color-text-4)', marginTop: 2 }}>{widget.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <span className="text-sm" style={{ color: 'var(--color-text-3)' }}>
            {selected.size > 0 ? `${selected.size} widget${selected.size > 1 ? 's' : ''} selected` : 'No widgets selected'}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-2)' }}
            >Cancel</button>
            <button
              onClick={handleAdd}
              disabled={selected.size === 0}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
              style={{ background: 'var(--color-primary-emphasis)', opacity: selected.size === 0 ? 0.5 : 1 }}
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
          <rect x={Number(x)} y={0} width={46} height={22} rx={5} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
          <text x={Number(x) + 7} y={9} fontSize={6} fill="var(--color-text-4)">{lbl as string}</text>
          <text x={Number(x) + 7} y={18} fontSize={8} fontWeight="700" fill="var(--color-text-1)">{val as string}</text>
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
          <text key={i} x={i * 18 + 2} y={70} fontSize={6} fill="var(--color-text-4)" textAnchor="middle">{d}</text>
        ))}
      </g>
    </svg>
  );
}

function DemoPreview({ color }: { color: string }) {
  // Donut + horizontal bars
  const R = 20, cx = 34, cy = 42, sw = 7;
  const segments = [
    { pct: 0.30, c: 'var(--color-primary)' }, { pct: 0.22, c: color },
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
    { label: 'Male 22–35', pct: 0.30, c: 'var(--color-primary)' },
    { label: 'Female 22–35', pct: 0.22, c: color },
    { label: 'Male 13–21', pct: 0.18, c: '#F59E0B' },
    { label: 'Female 13–21', pct: 0.14, c: '#3B82F6' },
  ];

  return (
    <svg width="100%" viewBox="0 0 160 90" style={{ display: 'block' }}>
      {/* Donut */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--color-border)" strokeWidth={sw} />
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill="none" stroke={a.c} strokeWidth={sw} strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={8} fontWeight="700" fill="var(--color-text-1)">15.2K</text>
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize={5.5} fill="var(--color-text-4)">visitors</text>
      {/* Bars */}
      {bars.map((b, i) => (
        <g key={b.label} transform={`translate(74, ${8 + i * 19})`}>
          <text y={7} fontSize={6} fill="var(--color-text-3)">{b.label}</text>
          <rect y={10} width={80} height={5} rx={2} fill="var(--color-surface-2)" />
          <rect y={10} width={80 * b.pct} height={5} rx={2} fill={b.c} />
          <text x={84} y={15} fontSize={6} fill="var(--color-text-2)" fontWeight="600">{Math.round(b.pct * 100)}%</text>
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
          <rect x={Number(x)} y={0} width={72} height={22} rx={5} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
          <text x={Number(x) + 8} y={9} fontSize={6} fill="var(--color-text-4)">{lbl as string}</text>
          <text x={Number(x) + 8} y={18} fontSize={9} fontWeight="700" fill="var(--color-text-1)">{val as string}</text>
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
            <text x={x + bw / 2} y={chartY + chartH + 9} textAnchor="middle" fontSize={5.5} fill="var(--color-text-4)">{hours[i]}</text>
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
    const tpl = TEMPLATES.find(t => t.id === tplId);
    if (tpl) setPageTitle(tpl.label);
  };

  const handleSelectCustom = () => {
    setSelectedTemplate(null);
    setIsCustomCard(true);
    setActiveTab('custom');
    setPageTitle('');
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
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-1)' }}>Create New Page</h3>
            <button onClick={onClose} className="p-1.5 rounded-md" style={{ color: 'var(--color-text-4)' }}>
              <X size={18} strokeWidth={2} />
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Choose a template or build from scratch</p>

          {/* Page title input */}
          <div className="mt-4">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-2)' }}>Page Title</label>
            <input
              type="text"
              placeholder="e.g. Traffic Overview, Store Performance…"
              value={pageTitle}
              onChange={e => setPageTitle(e.target.value)}
              autoFocus
              className="w-full text-sm rounded-xl px-4 py-2.5 outline-none"
              style={{ border: '1.5px solid var(--color-border)', color: 'var(--color-text-1)', transition: 'border-color 0.15s' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['templates', 'custom'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'custom') {
                    setSelectedTemplate(null);
                    setPageTitle('');
                  }
                }}
                className="px-4 py-2 text-sm font-medium capitalize transition-colors"
                style={{
                  color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-3)',
                  borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
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
                      border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: 'var(--color-surface)',
                      boxShadow: isSelected ? '0 0 0 3px var(--color-focus-ring)' : 'none',
                    }}
                  >
                    {/* Mini dashboard preview */}
                    <div style={{ background: 'var(--color-widget-preview-bg)', borderBottom: `1px solid ${isSelected ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`, padding: '14px 14px 10px' }}>
                      {tpl.id === 'tpl_traffic' && <TrafficPreview color={tpl.iconColor} />}
                      {tpl.id === 'tpl_demo'    && <DemoPreview    color={tpl.iconColor} />}
                      {tpl.id === 'tpl_queue'   && <QueuePreview   color={tpl.iconColor} />}
                    </div>
                    {/* Label */}
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-1)' }}>{tpl.label}</p>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--color-text-4)' }}>{tpl.description}</p>
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
                  <p className="text-xs font-bold uppercase mb-2.5" style={{ color: 'var(--color-text-4)', letterSpacing: '0.07em' }}>{group}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ALL_WIDGETS.filter(w => w.group === group).map(widget => {
                      const isSelected = customSelected.has(widget.id);
                      return (
                        <button
                          key={widget.id}
                          onClick={() => toggleCustomWidget(widget.id)}
                          className="text-left rounded-xl overflow-hidden transition-all"
                          style={{
                            border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: 'var(--color-surface)',
                            boxShadow: isSelected ? '0 0 0 3px var(--color-focus-ring)' : 'none',
                          }}
                        >
                          <div style={{
                            background: 'var(--color-widget-preview-bg)',
                            borderBottom: `1px solid ${isSelected ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                            padding: '12px 12px 8px',
                            pointerEvents: 'none',
                          }}>
                            {widget.preview}
                          </div>
                          <div style={{ padding: '8px 10px 9px' }}>
                            <p style={{ fontSize: 11.5, fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-1)' }}>{widget.label}</p>
                            <p style={{ fontSize: 10.5, color: 'var(--color-text-4)', marginTop: 2 }}>{widget.description}</p>
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
          style={{ borderTop: '1px solid var(--color-border-subtle)', flexShrink: 0 }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-2)' }}
          >Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
            style={{ background: 'var(--color-primary-emphasis)', opacity: canCreate ? 1 : 0.4, cursor: canCreate ? 'pointer' : 'not-allowed' }}
          >Create Page</button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const DEFAULT_TABS: AnalyticsTab[] = [
  {
    id: 'tab_overview',
    label: 'Overview',
    widgets: [
      // Footfall & Traffic
      'footfall_trend', 'passerby_trend',
      'india_walkin_chart', 'region_compare_chart',
      'peak_hours', 'conversion_rate',
      'footfall_heatmap',
      // Queue
      'queue_length', 'wait_time',
      // Demographics
      'demographics_donut', 'gender_trend',
      'age_bar',
      'gender_by_hour', 'gender_by_region',
      'age_grp_hourly', 'age_grp_regional',
      'gender_breakdown_pie', 'age_breakdown_pie',
      // Store Performance
      'top5_performers', 'bottom5_performers',
      'top_stores', 'store_conversion',
      'store_heatmap', 'store_demo_ranking',
      'store_staff_assist',
    ],
  },
  {
    id: 'tab_traffic',
    label: 'Traffic',
    widgets: ['india_walkin_chart', 'region_compare_chart', 'footfall_trend', 'passerby_trend', 'peak_hours', 'conversion_rate'],
  },
  {
    id: 'tab_demographics',
    label: 'Demographics',
    widgets: ['gender_by_hour', 'gender_by_region', 'age_grp_hourly', 'age_grp_regional', 'gender_breakdown_pie', 'age_breakdown_pie', 'demographics_donut', 'gender_trend'],
  },
  {
    id: 'tab_store_performance',
    label: 'Store Performance',
    widgets: ['top5_performers', 'bottom5_performers', 'store_demo_ranking', 'store_staff_assist', 'store_conversion', 'footfall_heatmap'],
  },
  {
    id: 'tab_queue',
    label: 'Queue Management',
    widgets: ['queue_length', 'wait_time', 'peak_hours', 'conversion_rate'],
  },
];

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tabs, setTabs] = useState<AnalyticsTab[]>(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState<string | null>('tab_overview');
  const [showAddWidgets, setShowAddWidgets] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftWidgets, setDraftWidgets] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('M');
  const [autoSnapshots, setAutoSnapshots] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  // Handle Quick Action deep-links
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new-page') {
      setShowCreatePage(true);
      router.replace('/dashboard/analytics');
    } else if (action === 'view-snapshots') {
      setAutoSnapshots(true);
      router.replace('/dashboard/analytics');
      // Reset flag after one tick so it doesn't re-fire on rerenders
      setTimeout(() => setAutoSnapshots(false), 100);
    }
  }, [searchParams, router]);

  const currentTab = tabs.find(t => t.id === activeTab) ?? null;

  // "Add Widgets" is disabled on Overview when all default widgets are already present.
  // As soon as any widget is removed (edit mode → save), the button re-enables.
  const overviewDefaultWidgets = DEFAULT_TABS[0].widgets;
  const addWidgetsDisabled =
    activeTab === 'tab_overview' &&
    overviewDefaultWidgets.every(w => currentTab?.widgets.includes(w) ?? false);

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
          style={{ display: 'flex', alignItems: 'stretch', padding: '0 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0, height: 52 }}
        >
          {/* Page tabs */}
          {tabs.map(tab => (
            <div key={tab.id} className="relative group flex items-center">
              <button
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '0 14px',
                  fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 500,
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-3)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  marginBottom: -1,
                  background: 'transparent', cursor: 'pointer',
                  transition: 'color 150ms',
                }}
              >
                {tab.label}
              </button>
              <button
                onClick={() => deleteTab(tab.id)}
                className="opacity-0 group-hover:opacity-100 ml-0.5 p-0.5 rounded transition-opacity"
                style={{ color: 'var(--color-text-4)' }}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          ))}

          {/* New Page button */}
          <button
            onClick={() => setShowCreatePage(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 8, alignSelf: 'center', height: 32, padding: '0 14px', borderRadius: 6, fontSize: 12.5, fontWeight: 500, color: 'var(--color-primary)', border: '1px solid var(--color-accent-border)', background: 'var(--color-accent-bg)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-bg-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-bg)'}
          >
            <Plus size={13} strokeWidth={2} />
            New Page
          </button>

          <div className="flex-1" />

          {/* D/W/M/Y timeframe selector — single pill container */}
          <div
            style={{
              display: 'flex', alignItems: 'center', alignSelf: 'center',
              marginRight: 8,
              background: 'var(--color-surface-2)',
              borderRadius: 6,
              padding: 3,
              gap: 2,
            }}
          >
            {(['D', 'W', 'M', 'Y'] as Timeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  width: 32,
                  height: 26,
                  borderRadius: 6,
                  border: 'none',
                  background: timeframe === tf ? 'var(--color-surface)' : 'transparent',
                  boxShadow: timeframe === tf ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                  color: timeframe === tf ? 'var(--color-primary)' : 'var(--color-text-3)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0, alignSelf: 'center' }} />

          {/* Add Widgets + Edit Layout — shown when a page is active */}
          {activeTab && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'center' }}>
              {isEditMode ? (
                <button
                  onClick={cancelEditMode}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer' }}
                >
                  <X size={13} strokeWidth={2.5} />
                  Cancel Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => !addWidgetsDisabled && setShowAddWidgets(true)}
                    disabled={addWidgetsDisabled}
                    title={addWidgetsDisabled ? 'Remove a widget first to enable adding new ones' : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px',
                      borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                      background: addWidgetsDisabled ? 'var(--color-border)' : 'var(--color-primary)',
                      color: addWidgetsDisabled ? 'var(--color-text-4)' : 'white',
                      border: 'none',
                      cursor: addWidgetsDisabled ? 'not-allowed' : 'pointer',
                      opacity: addWidgetsDisabled ? 0.7 : 1,
                      transition: 'background 150ms, opacity 150ms',
                    }}
                    onMouseEnter={e => { if (!addWidgetsDisabled) (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis-hover)'; }}
                    onMouseLeave={e => { if (!addWidgetsDisabled) (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-emphasis)'; }}
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    Add Widgets
                  </button>
                  {currentTab && currentTab.widgets.length > 0 && (
                    <button
                      onClick={enterEditMode}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, background: 'var(--color-surface-2)', color: 'var(--color-text-2)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
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
            background: 'var(--color-primary-light)',
            borderBottom: '1px solid var(--color-accent-border)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Edit2 size={13} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>Editing Analytics Layout</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-4)', marginLeft: 4 }}>
              · Drag to reorder · × to remove
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={cancelEditMode}
              style={{
                padding: '6px 16px', borderRadius: 6,
                border: '1px solid var(--color-accent-border)',
                background: 'var(--color-surface)', color: 'var(--color-primary)',
                fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
              }}
            >Cancel</button>
            <button
              onClick={saveLayout}
              style={{
                padding: '6px 16px', borderRadius: 6,
                border: 'none',
                background: 'var(--color-primary-emphasis)', color: 'white',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              }}
            >Save Layout</button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ background: 'var(--color-page-bg)' }}>
        {tabs.length === 0 ? (
          /* ── Empty state: no pages ── */
          <div className="flex flex-col items-center justify-center h-full" style={{ minHeight: 400 }}>
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'var(--color-primary-light)' }}
            >
              <BarChart2 size={40} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-1)' }}>No analytics pages yet</h3>
            <p className="text-sm mb-6 text-center max-w-xs" style={{ color: 'var(--color-text-3)' }}>
              Create your first page and start adding widgets, charts, and metrics tailored to your stores.
            </p>
            <button
              onClick={() => setShowCreatePage(true)}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: 'var(--color-primary-emphasis)' }}
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
                style={{ background: 'var(--color-surface-2)' }}
              >
                <LayoutGrid size={24} strokeWidth={1.5} style={{ color: 'var(--color-text-4)' }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>This page is empty</p>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-4)' }}>Add widgets to start building your analytics view</p>
              <button
                onClick={() => setShowAddWidgets(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'var(--color-primary-emphasis)' }}
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
                <div key={widgetId} style={{ gridColumn: FULL_WIDTH_IDS.has(widgetId) ? 'span 2' : 'span 1' }}>
                  <PlacedWidget
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
                    timeframe={timeframe}
                    autoOpenSnapshots={widgetId === 'footfall_trend' && autoSnapshots}
                  />
                </div>
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
          currentWidgets={currentTab?.widgets ?? []}
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
