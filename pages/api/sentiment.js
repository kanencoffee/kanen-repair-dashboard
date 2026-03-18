import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const dataPath = path.join(process.cwd(), '..', 'data', 'customer-sentiment-2026-03.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Could not load sentiment data' });
  }
}
