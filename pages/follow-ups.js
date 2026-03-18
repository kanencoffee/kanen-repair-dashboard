import { useState, useEffect } from 'react';

const RISK_STYLES = {
  high: { bg: 'bg-rose-900/30', border: 'border-rose-800', badge: 'bg-rose-700 text-rose-100', icon: '🔴' },
  medium: { bg: 'bg-amber-900/20', border: 'border-amber-800', badge: 'bg-amber-700 text-amber-100', icon: '🟡' },
  low: { bg: 'bg-slate-800/40', border: 'border-slate-700', badge: 'bg-slate-700 text-slate-300', icon: '🟢' },
};

const STATUS_STYLES = {
  pending: 'bg-slate-700 text-slate-200',
  contacted: 'bg-blue-800 text-blue-200',
  resolved: 'bg-emerald-800 text-emerald-200',
  returned: 'bg-rose-800 text-rose-200',
};

const FollowUpsDashboard = () => {
  const [followUps, setFollowUps] = useState([]);
  const [filter, setFilter] = useState('overdue');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetch('/api/follow-ups')
      .then(res => res.json())
      .then(data => {
        setFollowUps(data.follow_ups || []);
        setStats(data.stats || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch('/api/follow-ups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setFollowUps(prev =>
        prev.map(f => f.id === id ? { ...f, status: newStatus } : f)
      );
    } catch (e) {
      console.error('Update failed', e);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filtered = followUps.filter(f => {
    if (filter === 'overdue') return f.status === 'pending' && f.follow_up_date <= today;
    if (filter === 'upcoming') return f.status === 'pending' && f.follow_up_date > today;
    if (filter === 'high') return f.risk_level === 'high' && f.status === 'pending';
    if (filter === 'contacted') return f.status === 'contacted';
    if (filter === 'resolved') return f.status === 'resolved';
    if (filter === 'returned') return f.status === 'returned';
    return true;
  });

  const overdue = followUps.filter(f => f.status === 'pending' && f.follow_up_date <= today);
  const highRisk = followUps.filter(f => f.risk_level === 'high' && f.status === 'pending');

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-slate-400">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Repair Follow-ups</h1>
          <p className="text-sm text-slate-400 mt-1">
            Quality assurance — check in with customers after complex repairs
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-rose-900/50 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">Overdue</p>
            <p className="text-2xl font-bold text-rose-400">{overdue.length}</p>
          </div>
          <div className="rounded-xl border border-amber-900/50 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">High Risk Pending</p>
            <p className="text-2xl font-bold text-amber-400">{highRisk.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-900/50 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">Resolved</p>
            <p className="text-2xl font-bold text-emerald-400">
              {followUps.filter(f => f.status === 'resolved').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">Total Tracked</p>
            <p className="text-2xl font-bold">{followUps.length}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-lg bg-slate-800 p-1 mb-6 text-sm w-fit">
          {[
            { key: 'overdue', label: `Overdue (${overdue.length})` },
            { key: 'high', label: 'High Risk' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'contacted', label: 'Contacted' },
            { key: 'resolved', label: 'Resolved' },
            { key: 'returned', label: 'Returned' },
            { key: 'all', label: 'All' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                filter === tab.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Follow-up list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
              <p className="text-slate-500">No follow-ups in this view</p>
            </div>
          ) : (
            filtered.map(f => {
              const risk = RISK_STYLES[f.risk_level] || RISK_STYLES.low;
              const isOverdue = f.status === 'pending' && f.follow_up_date <= today;
              return (
                <div key={f.id} className={`rounded-xl border ${risk.border} ${risk.bg} p-4`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{risk.icon}</span>
                        <span className="font-medium">{f.customer_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${risk.badge}`}>
                          {f.risk_level}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[f.status]}`}>
                          {f.status}
                        </span>
                        {isOverdue && (
                          <span className="text-xs text-rose-400 font-medium">OVERDUE</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 space-x-4">
                        <span>{f.repair_type}</span>
                        <span>Repair: {f.repair_date}</span>
                        <span>Follow-up: {f.follow_up_date}</span>
                      </div>
                      {f.notes && (
                        <p className="text-xs text-slate-500 mt-1 truncate">{f.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {f.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(f.id, 'contacted')}
                            className="text-xs px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white transition-colors"
                          >
                            Mark Contacted
                          </button>
                          <button
                            onClick={() => updateStatus(f.id, 'resolved')}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
                          >
                            Resolved
                          </button>
                        </>
                      )}
                      {f.status === 'contacted' && (
                        <>
                          <button
                            onClick={() => updateStatus(f.id, 'resolved')}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
                          >
                            Resolved
                          </button>
                          <button
                            onClick={() => updateStatus(f.id, 'returned')}
                            className="text-xs px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white transition-colors"
                          >
                            Returned ↩
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpsDashboard;
