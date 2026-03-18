import { useState, useEffect } from 'react';

const COLORS = {
  positive: '#10b981',
  neutral: '#64748b',
  negative: '#f43f5e',
};

const SentimentPie = ({ data }) => {
  if (!data || !data.total) return null;

  const total = data.total;
  const slices = [
    { key: 'positive', count: data.positive?.count || 0, color: COLORS.positive, label: 'Positive' },
    { key: 'neutral', count: data.neutral?.count || 0, color: COLORS.neutral, label: 'Neutral' },
    { key: 'negative', count: data.negative?.count || 0, color: COLORS.negative, label: 'Negative' },
  ];

  // SVG pie chart
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  let cumulative = 0;

  const paths = slices.map((slice) => {
    const pct = slice.count / total;
    const startAngle = cumulative * 2 * Math.PI;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI;

    if (pct === 0) return null;
    if (pct >= 1) {
      return (
        <circle key={slice.key} cx={cx} cy={cy} r={r} fill={slice.color} />
      );
    }

    const x1 = cx + r * Math.sin(startAngle);
    const y1 = cy - r * Math.cos(startAngle);
    const x2 = cx + r * Math.sin(endAngle);
    const y2 = cy - r * Math.cos(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;

    return (
      <path
        key={slice.key}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={slice.color}
      />
    );
  });

  return (
    <div className="flex items-center gap-8">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {paths}
        <circle cx={cx} cy={cy} r={45} fill="#0f172a" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="11">
          messages
        </text>
      </svg>
      <div className="space-y-2">
        {slices.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-sm text-slate-300">
              {s.label}: {s.count} ({((s.count / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopicList = ({ topics, examples, color }) => {
  if (!topics || Object.keys(topics).length === 0) {
    return <p className="text-sm text-slate-500 italic">No data</p>;
  }

  const topicLabels = {
    gratitude: '🙏 Gratitude / Thanks',
    scheduling: '📅 Scheduling & Pickups',
    billing: '💰 Billing & Invoices',
    product_inquiry: '🔍 Product Inquiries',
    repair_issue: '🔧 Repair Issues',
    warranty: '🛡️ Warranty Questions',
    cancellation: '❌ Cancellations / Returns',
    general: '💬 General',
  };

  return (
    <div className="space-y-3">
      {Object.entries(topics).map(([topic, count]) => (
        <div key={topic}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color }}>
              {topicLabels[topic] || topic}
            </span>
            <span className="text-xs text-slate-400">{count} messages</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 mt-1">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                backgroundColor: color,
                width: `${Math.min((count / Math.max(...Object.values(topics))) * 100, 100)}%`,
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      ))}

      {examples && examples.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Sample Messages</p>
          {examples.slice(0, 3).map((ex, i) => (
            <div key={i} className="rounded-lg bg-slate-800/50 px-3 py-2 text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">{ex.sender}</span>
                <span className="text-slate-500">{ex.date}</span>
              </div>
              <p className="text-slate-300 italic">&ldquo;{ex.excerpt}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SentimentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from the static JSON file
    fetch('/api/sentiment')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: load directly
        fetch('http://localhost:8000/v1/analytics/customer-sentiment')
          .then((res) => res.json())
          .then((d) => { setData(d); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading sentiment data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">No sentiment data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Customer Sentiment</h1>
          <p className="text-sm text-slate-400 mt-1">
            Last 60 days — {data.total} customer messages analyzed from email
          </p>
        </div>

        {/* Pie Chart + Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/40 mb-8">
          <h2 className="text-lg font-semibold mb-6">Sentiment Distribution</h2>
          <SentimentPie data={data} />
        </div>

        {/* Three columns: Positive / Neutral / Negative */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Positive */}
          <div className="rounded-2xl border border-emerald-900/50 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="font-semibold text-emerald-400">
                Positive ({data.positive?.count || 0})
              </h3>
            </div>
            <TopicList
              topics={data.positive?.topics}
              examples={data.positive?.examples}
              color={COLORS.positive}
            />
          </div>

          {/* Neutral */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
              <h3 className="font-semibold text-slate-400">
                Neutral ({data.neutral?.count || 0})
              </h3>
            </div>
            <TopicList
              topics={data.neutral?.topics}
              examples={data.neutral?.examples}
              color={COLORS.neutral}
            />
          </div>

          {/* Negative */}
          <div className="rounded-2xl border border-rose-900/50 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <h3 className="font-semibold text-rose-400">
                Negative ({data.negative?.count || 0})
              </h3>
            </div>
            <TopicList
              topics={data.negative?.topics}
              examples={data.negative?.examples}
              color={COLORS.negative}
            />
          </div>
        </div>

        {/* Insights */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/40">
          <h2 className="text-lg font-semibold mb-4">Key Takeaways</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="text-emerald-400 text-lg">✓</span>
              <div>
                <p className="font-medium text-slate-200">Customers love the service</p>
                <p className="text-slate-400">
                  {data.positive?.pct || 0}% of messages are positive. Gratitude and scheduling
                  confirmations dominate — customers appreciate the communication and repair quality.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-slate-400 text-lg">—</span>
              <div>
                <p className="font-medium text-slate-200">Neutral messages are transactional</p>
                <p className="text-slate-400">
                  Billing inquiries, PO numbers, and scheduling logistics. These are routine and healthy.
                </p>
              </div>
            </li>
            {(data.negative?.count || 0) > 0 && (
              <li className="flex gap-3">
                <span className="text-rose-400 text-lg">!</span>
                <div>
                  <p className="font-medium text-slate-200">Watch recurring repair issues</p>
                  <p className="text-slate-400">
                    Only {data.negative?.count || 0} negative message(s), but recurring problems
                    (same leak returning) are a trust risk. Consider a follow-up checklist for
                    complex repairs.
                  </p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SentimentDashboard;
