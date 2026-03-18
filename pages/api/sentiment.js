export default async function handler(req, res) {
  const apiUrl = process.env.API_URL || 'http://localhost:8000';
  try {
    const r = await fetch(`${apiUrl}/v1/analytics/customer-sentiment`);
    const data = await r.json();
    // Transform to match dashboard format
    res.status(200).json({
      follow_ups: [],
      sentiment: data,
      positive_pct: data.positive?.pct || 0,
      neutral_pct: data.neutral?.pct || 0,
      negative_pct: data.negative?.pct || 0,
      total: data.total || 0,
      topics: data.positive?.topics || {},
      negative_topics: data.negative?.topics || {},
      sample_positives: data.positive?.samples || [],
      sample_negatives: data.negative?.samples || [],
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
