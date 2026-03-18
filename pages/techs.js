import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TECH_COLORS = {
  Julian: '#3B82F6',
  Khaldoun: '#EF4444',
  Astrid: '#F59E0B',
  Adam: '#8B5CF6',
  Sam: '#6B7280',
  Mario: '#374151',
};

const StatCard = ({ label, value, sub }) => (
  <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
    <p className="text-xs text-slate-400">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
  </div>
);

export default function TechPerformance() {
  const [techs, setTechs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/techs')
      .then(r => r.json())
      .then(d => { setTechs(d.techs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const activeColor = (name) => TECH_COLORS[name] || '#64748B';

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400">Loading...</p>
    </div>
  );

  const sel = selected ? techs.find(t => t.name === selected) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Technician Performance</h1>
          <p className="text-sm text-slate-400 mt-1">Repairs, revenue, and specializations by tech</p>
        </div>

        {/* Volume chart */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 mb-6">
          <h2 className="text-sm font-medium text-slate-400 mb-4">Repairs by Technician (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={techs} onClick={(e) => e?.activePayload && setSelected(e.activePayload[0]?.payload?.name)}>
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#F1F5F9' }}
              />
              <Bar dataKey="repairs" radius={[4, 4, 0, 0]}>
                {techs.map((t) => (
                  <Cell key={t.name} fill={activeColor(t.name)} opacity={selected && selected !== t.name ? 0.3 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 mt-2 text-center">Click a bar to drill in</p>
        </div>

        {/* Tech cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {techs.map(t => (
            <button
              key={t.name}
              onClick={() => setSelected(selected === t.name ? null : t.name)}
              className={`rounded-xl border p-4 text-left transition-all ${
                selected === t.name
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeColor(t.name) }} />
                <span className="font-medium">{t.name}</span>
              </div>
              <p className="text-2xl font-bold">{t.repairs}</p>
              <p className="text-xs text-slate-400">repairs</p>
              <p className="text-sm text-slate-300 mt-1">${(t.revenue / 1000).toFixed(0)}k revenue</p>
              <p className="text-xs text-slate-500">${t.avg_ticket?.toFixed(0)} avg ticket</p>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {sel && (
          <div className="rounded-xl border border-slate-600 bg-slate-900/80 p-6">
            <h2 className="text-lg font-bold mb-4">{sel.name} — Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Repairs" value={sel.repairs} />
              <StatCard label="Revenue" value={`$${(sel.revenue / 1000).toFixed(1)}k`} />
              <StatCard label="Avg Ticket" value={`$${sel.avg_ticket?.toFixed(0)}`} />
              <StatCard label="Since" value={sel.since?.split('-').slice(0,2).join('/')} />
            </div>
            {sel.top_brands?.length > 0 && (
              <div>
                <h3 className="text-sm text-slate-400 mb-3">Top Machine Brands</h3>
                <div className="flex flex-wrap gap-2">
                  {sel.top_brands.map(b => (
                    <span key={b.brand} className="px-3 py-1 rounded-full bg-slate-800 text-sm">
                      {b.brand} <span className="text-slate-400">({b.count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
