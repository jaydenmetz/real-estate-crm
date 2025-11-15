// backend/src/controllers/communications.controller.js
const logger = require('../../../../utils/logger');
// Mock data store
let communications = [];

exports.list = async (req, res) => {
  res.json({ success: true, data: communications });
};

exports.create = async (req, res) => {
  const newComm = { id: Date.now().toString(), ...req.body, createdAt: new Date().toISOString() };
  communications.push(newComm);
  res.status(201).json({ success: true, data: newComm });
};

exports.get = async (req, res) => {
  const c = communications.find((c) => c.id === req.params.id);
  if (!c) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: c });
};

exports.update = async (req, res) => {
  const idx = communications.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  communications[idx] = { ...communications[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: communications[idx] });
};

exports.remove = async (req, res) => {
  communications = communications.filter((c) => c.id !== req.params.id);
  res.status(204).end();
};
