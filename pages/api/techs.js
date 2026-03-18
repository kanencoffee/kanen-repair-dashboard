import path from 'path';
import { execSync } from 'child_process';

export default function handler(req, res) {
  try {
    const dbPath = path.join(process.cwd(), '..', 'data', 'kanen.db');

    const techQuery = `
      SELECT
        pd.technician as name,
        COUNT(*) as repairs,
        ROUND(SUM(pd.value), 2) as revenue,
        ROUND(AVG(pd.value), 2) as avg_ticket,
        MIN(DATE(pd.add_time)) as since
      FROM pipedrive_deals pd
      WHERE pd.technician IS NOT NULL
        AND pd.technician NOT IN ('', 'Unassigned')
        AND pd.status = 'won'
        AND pd.add_time >= date('now', '-12 months')
      GROUP BY pd.technician
      ORDER BY repairs DESC
    `.replace(/\n/g, ' ').trim();

    const brandQuery = `
      SELECT
        pd.technician,
        CASE
          WHEN p.name LIKE '%Breville%' THEN 'Breville'
          WHEN p.name LIKE '%Jura%' THEN 'Jura'
          WHEN p.name LIKE '%Delonghi%' OR p.name LIKE '%DeLonghi%' THEN 'Delonghi'
          WHEN p.name LIKE '%La Pavoni%' THEN 'La Pavoni'
          WHEN p.name LIKE '%E-61%' OR p.name LIKE '%E61%' THEN 'E-61'
          WHEN p.name LIKE '%Rancilio%' THEN 'Rancilio'
          WHEN p.name LIKE '%Lelit%' THEN 'Lelit'
          WHEN p.name LIKE '%La Marzocco%' THEN 'La Marzocco'
          WHEN p.name LIKE '%Gaggia%' OR p.name LIKE '%Saeco%' THEN 'Gaggia/Saeco'
          WHEN p.name LIKE '%Profitec%' THEN 'Profitec'
          WHEN p.name LIKE '%Dual Boiler%' THEN 'Dual Boiler'
          ELSE NULL
        END as brand,
        COUNT(DISTINCT ro.id) as cnt
      FROM pipedrive_deals pd
      JOIN repair_orders ro ON LOWER(TRIM(ro.customer_name)) = LOWER(TRIM(pd.person_name))
        AND julianday(ro.opened_at) >= julianday(pd.add_time) - 30
        AND julianday(ro.opened_at) <= julianday(pd.add_time) + 30
      JOIN repair_part_usage rpu ON rpu.repair_id = ro.id
      JOIN parts p ON p.id = rpu.part_id
      WHERE pd.technician IS NOT NULL
        AND pd.technician NOT IN ('', 'Unassigned')
        AND pd.status = 'won'
      GROUP BY pd.technician, brand
      HAVING brand IS NOT NULL AND cnt >= 2
      ORDER BY pd.technician, cnt DESC
    `.replace(/\n/g, ' ').trim();

    const techRows = JSON.parse(execSync(`sqlite3 -json "${dbPath}" "${techQuery}"`, { encoding: 'utf-8', timeout: 10000 }) || '[]');
    const brandRows = JSON.parse(execSync(`sqlite3 -json "${dbPath}" "${brandQuery}"`, { encoding: 'utf-8', timeout: 10000 }) || '[]');

    // Group brands by tech
    const brandsByTech = {};
    for (const row of brandRows) {
      if (!brandsByTech[row.technician]) brandsByTech[row.technician] = [];
      brandsByTech[row.technician].push({ brand: row.brand, count: row.cnt });
    }

    const techs = techRows.map(t => ({
      ...t,
      top_brands: (brandsByTech[t.name] || []).slice(0, 6),
    }));

    res.status(200).json({ techs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
