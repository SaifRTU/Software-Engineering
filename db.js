import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'risk-tracker.db');

if (!fs.existsSync(dbPath)) {
  throw new Error('Database not found. Run: npm run db:init');
}

const db = new Database(dbPath);

export const CATEGORIES = ['schedule', 'cost', 'technical', 'security', 'compliance', 'stakeholders'];
export const RISK_STATUSES = ['Open', 'In Mitigation', 'Monitoring', 'Closed', 'Accepted'];
export const ACTION_STATUSES = ['pending', 'in_progress', 'completed', 'overdue'];

function ensureScore(r) {
  if (r && r.probability != null && r.impact != null && (r.risk_score == null || r.risk_level == null)) {
    const score = r.probability * r.impact;
    r.risk_score = score;
    r.risk_level = score >= 21 ? 'Critical' : score >= 13 ? 'High' : score >= 7 ? 'Medium' : 'Low';
  }
  return r;
}

export function getRisks(opts = {}) {
  const { archived = 0, category, status } = opts;
  let sql = `
    SELECT r.*, u.name AS owner_name
    FROM risks r
    LEFT JOIN users u ON r.owner_id = u.id
    WHERE r.archived = ?
  `;
  const params = [archived];
  if (category) { sql += ' AND r.category = ?'; params.push(category); }
  if (status) { sql += ' AND r.status = ?'; params.push(status); }
  sql += ' ORDER BY r.risk_score DESC, r.updated_at DESC';
  const rows = db.prepare(sql).all(...params);
  return rows.map(ensureScore);
}

export function getRiskById(id) {
  const r = db.prepare(`
    SELECT r.*, u.name AS owner_name
    FROM risks r
    LEFT JOIN users u ON r.owner_id = u.id
    WHERE r.id = ?
  `).get(id);
  return ensureScore(r);
}

export function createRisk(data) {
  const { title, description, category, probability, impact, owner_id, status = 'Open', evidence_notes } = data;
  const result = db.prepare(`
    INSERT INTO risks (title, description, category, probability, impact, owner_id, status, evidence_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description || null, category, probability, impact, owner_id || null, status, evidence_notes || null);
  db.prepare(`UPDATE risks SET risk_score = probability * impact, risk_level =
    CASE WHEN (probability * impact) >= 21 THEN 'Critical'
         WHEN (probability * impact) >= 13 THEN 'High'
         WHEN (probability * impact) >= 7 THEN 'Medium'
         ELSE 'Low' END WHERE id = ?`).run(result.lastInsertRowid);
  return getRiskById(result.lastInsertRowid);
}

export function updateRisk(id, data) {
  const allowed = ['title', 'description', 'category', 'probability', 'impact', 'owner_id', 'status', 'evidence_notes'];
  const updates = [];
  const values = [];
  for (const k of allowed) {
    if (data[k] !== undefined) {
      updates.push(`${k} = ?`);
      values.push(data[k]);
    }
  }
  if (updates.length === 0) return getRiskById(id);
  updates.push("updated_at = datetime('now')");
  values.push(id);
  db.prepare(`UPDATE risks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  if (data.probability !== undefined || data.impact !== undefined) {
    db.prepare(`UPDATE risks SET risk_score = probability * impact, risk_level =
      CASE WHEN (probability * impact) >= 21 THEN 'Critical'
           WHEN (probability * impact) >= 13 THEN 'High'
           WHEN (probability * impact) >= 7 THEN 'Medium'
           ELSE 'Low' END WHERE id = ?`).run(id);
  }
  return getRiskById(id);
}

export function archiveRisk(id, archived = 1) {
  db.prepare('UPDATE risks SET archived = ?, updated_at = datetime(\'now\') WHERE id = ?').run(archived, id);
  return getRiskById(id);
}

export function getMitigationActions(riskId) {
  return db.prepare(`
    SELECT m.*, u.name AS owner_name
    FROM mitigation_actions m
    LEFT JOIN users u ON m.owner_id = u.id
    WHERE m.risk_id = ?
    ORDER BY m.due_date ASC, m.id ASC
  `).all(riskId);
}

export function getOverdueActions() {
  return db.prepare(`
    SELECT m.*, r.title AS risk_title, r.risk_level, u.name AS owner_name
    FROM mitigation_actions m
    JOIN risks r ON m.risk_id = r.id
    LEFT JOIN users u ON m.owner_id = u.id
    WHERE r.archived = 0 AND m.status NOT IN ('completed') AND m.due_date IS NOT NULL AND m.due_date < date('now')
    ORDER BY m.due_date ASC
  `).all();
}

export function createMitigationAction(data) {
  const { risk_id, title, description, due_date, owner_id, status = 'pending' } = data;
  db.prepare(`
    INSERT INTO mitigation_actions (risk_id, title, description, due_date, owner_id, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(risk_id, title, description || null, due_date || null, owner_id || null, status);
  return db.prepare('SELECT * FROM mitigation_actions WHERE id = (SELECT last_insert_rowid())').get();
}

export function updateMitigationAction(id, data) {
  const allowed = ['title', 'description', 'due_date', 'owner_id', 'status', 'completed_at'];
  const updates = [];
  const values = [];
  for (const k of allowed) {
    if (data[k] !== undefined) {
      updates.push(`${k} = ?`);
      values.push(data[k]);
    }
  }
  if (updates.length === 0) return db.prepare('SELECT * FROM mitigation_actions WHERE id = ?').get(id);
  updates.push("updated_at = datetime('now')");
  values.push(id);
  db.prepare(`UPDATE mitigation_actions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return db.prepare('SELECT * FROM mitigation_actions WHERE id = ?').get(id);
}

export function getUsers() {
  return db.prepare('SELECT id, email, name, role FROM users ORDER BY name').all();
}

export function getDashboard() {
  const risks = getRisks({ archived: 0 });
  const byCategory = risks.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
  const topRisks = risks.slice(0, 10);
  const overdueActions = getOverdueActions();
  const heatmap = [];
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      const count = risks.filter(r => r.probability === p && r.impact === i).length;
      heatmap.push({ probability: p, impact: i, count });
    }
  }
  return { topRisks, byCategory, overdueActions, heatmap };
}

export default db;
