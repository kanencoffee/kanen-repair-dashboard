export default async function handler(req, res) {
  const apiUrl = process.env.API_URL || 'https://api.kanencoffee.com';
  try {
    const r = await fetch(`${apiUrl}/v1/repairs/recent?limit=50`);
    const repairs = await r.json();
    // Map repairs to follow-up format
    const today = new Date().toISOString().split('T')[0];
    const followUps = (repairs || []).slice(0, 30).map((rep, i) => ({
      id: rep.id || i,
      repair_id: rep.id,
      customer_name: rep.customer_name || 'Unknown',
      repair_type: rep.repair_type || rep.description || 'Repair',
      risk_level: rep.total > 500 ? 'high' : rep.total > 300 ? 'medium' : 'low',
      follow_up_date: today,
      status: 'pending',
      notes: rep.notes || '',
      repair_date: rep.opened_at || rep.date || today,
    }));
    res.status(200).json({ follow_ups: followUps, stats: { total: followUps.length } });
  } catch (e) {
    res.status(500).json({ error: e.message, follow_ups: [] });
  }
}
