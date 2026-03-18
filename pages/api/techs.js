export default async function handler(req, res) {
  const apiUrl = process.env.API_URL || 'http://localhost:8000';
  try {
    const r = await fetch(`${apiUrl}/v1/analytics/brand-profiles`);
    const brands = await r.json();
    // Also get repair velocity for tech data  
    const v = await fetch(`${apiUrl}/v1/analytics/repair-velocity`);
    const velocity = await v.json();
    res.status(200).json({ techs: [], brands: brands || [], velocity: velocity || [] });
  } catch (e) {
    res.status(500).json({ error: e.message, techs: [] });
  }
}
