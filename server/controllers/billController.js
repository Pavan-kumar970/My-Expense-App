import { Bill } from '../models/Bill.js';

export async function listBills(req, res) {
  const docs = await Bill.find({ userId: req.user.id }).sort({ dueDate: 1 });
  res.json(docs);
}

export async function createBill(req, res) {
  const { name, amount, dueDate, recurring } = req.body;
  if (!name || amount == null || !dueDate) {
    return res.status(400).json({ error: 'name, amount, dueDate are required' });
  }
  const doc = await Bill.create({ userId: req.user.id, name, amount, dueDate, recurring });
  res.status(201).json(doc);
}

export async function updateBill(req, res) {
  const { id } = req.params;
  const doc = await Bill.findOneAndUpdate({ _id: id, userId: req.user.id }, req.body, { new: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
}

export async function deleteBill(req, res) {
  const { id } = req.params;
  const doc = await Bill.findOneAndDelete({ _id: id, userId: req.user.id });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}

