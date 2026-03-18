import path from 'path';
import { execSync } from 'child_process';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return getFollowUps(req, res);
  } else if (req.method === 'PUT') {
    return updateFollowUp(req, res);
  }
  res.status(405).json({ error: 'Method not allowed' });
}

function getFollowUps(req, res) {
  try {
    const dbPath = path.join(process.cwd(), '..', 'data', 'kanen.db');
    const query = `SELECT f.id, f.repair_id, f.customer_name, f.repair_type, f.risk_level, f.follow_up_date, f.status, f.notes, f.created_at, f.contacted_at, ro.opened_at as repair_date FROM follow_ups f LEFT JOIN repair_orders ro ON ro.id = f.repair_id ORDER BY CASE f.risk_level WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, f.follow_up_date ASC`;
    const result = execSync(
      `sqlite3 -json "${dbPath}" "${query}"`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    const followUps = JSON.parse(result || '[]');

    const stats = {
      total: followUps.length,
      pending: followUps.filter(f => f.status === 'pending').length,
      contacted: followUps.filter(f => f.status === 'contacted').length,
      resolved: followUps.filter(f => f.status === 'resolved').length,
      returned: followUps.filter(f => f.status === 'returned').length,
    };

    res.status(200).json({ follow_ups: followUps, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function updateFollowUp(req, res) {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: 'id and status required' });
    }
    const validStatuses = ['pending', 'contacted', 'resolved', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const dbPath = path.join(process.cwd(), '..', 'data', 'kanen.db');
    const safeId = parseInt(id);
    const contactedClause = status === 'contacted' ? ", contacted_at=datetime('now')" : '';
    execSync(
      `sqlite3 "${dbPath}" "UPDATE follow_ups SET status='${status}'${contactedClause} WHERE id=${safeId}"`,
      { encoding: 'utf-8', timeout: 5000 }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
