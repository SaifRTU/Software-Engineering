import express from 'express';
import cors from 'cors';
import * as db from './db.js';
import { exportCsv } from './routes/export.js';
import { exportPdf } from './routes/export-pdf.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- Config / reference data ---
app.get('/api/config', (req, res) => {
  res.json({
    categories: db.CATEGORIES,
    riskStatuses: db.RISK_STATUSES,
    actionStatuses: db.ACTION_STATUSES,
  });
});

app.get('/api/users', (req, res) => {
  try {
    res.json(db.getUsers());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Risks ---
app.get('/api/risks', (req, res) => {
  try {
    const archived = req.query.archived === '1' ? 1 : 0;
    const category = req.query.category || undefined;
    const status = req.query.status || undefined;
    const list = db.getRisks({ archived, category, status });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/risks/:id', (req, res) => {
  try {
    const risk = db.getRiskById(Number(req.params.id));
    if (!risk) return res.status(404).json({ error: 'Risk not found' });
    const actions = db.getMitigationActions(risk.id);
    res.json({ ...risk, mitigation_actions: actions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/risks', (req, res) => {
  try {
    const risk = db.createRisk(req.body);
    res.status(201).json(risk);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.patch('/api/risks/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!db.getRiskById(id)) return res.status(404).json({ error: 'Risk not found' });
    const risk = db.updateRisk(id, req.body);
    res.json(risk);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/risks/:id/archive', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!db.getRiskById(id)) return res.status(404).json({ error: 'Risk not found' });
    const risk = db.archiveRisk(id, 1);
    res.json(risk);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/risks/:id/restore', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!db.getRiskById(id)) return res.status(404).json({ error: 'Risk not found' });
    const risk = db.archiveRisk(id, 0);
    res.json(risk);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Mitigation actions ---
app.get('/api/risks/:riskId/actions', (req, res) => {
  try {
    const actions = db.getMitigationActions(Number(req.params.riskId));
    res.json(actions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/risks/:riskId/actions', (req, res) => {
  try {
    const riskId = Number(req.params.riskId);
    if (!db.getRiskById(riskId)) return res.status(404).json({ error: 'Risk not found' });
    const action = db.createMitigationAction({ ...req.body, risk_id: riskId });
    res.status(201).json(action);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.patch('/api/actions/:id', (req, res) => {
  try {
    const action = db.updateMitigationAction(Number(req.params.id), req.body);
    if (!action) return res.status(404).json({ error: 'Action not found' });
    res.json(action);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Dashboard ---
app.get('/api/dashboard', (req, res) => {
  try {
    res.json(db.getDashboard());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/overdue-actions', (req, res) => {
  try {
    res.json(db.getOverdueActions());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Export ---
app.get('/api/export/csv', (req, res) => {
  try {
    const csv = exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=risk-register.csv');
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/export/pdf', async (req, res) => {
  try {
    const buffer = await exportPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=risk-register.pdf');
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Risk Tracker API running at http://localhost:${PORT}`);
});
