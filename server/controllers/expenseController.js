import { Expense } from '../models/Expense.js';

export async function listExpenses(req, res) {
  const docs = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(docs);
}

export async function createExpense(req, res) {
  const { category, amount, date, description } = req.body;
  if (amount == null || !category || !date) {
    return res.status(400).json({ error: 'category, amount, date are required' });
  }
  const doc = await Expense.create({ userId: req.user.id, category, amount, date, description });
  res.status(201).json(doc);
}

export async function updateExpense(req, res) {
  const { id } = req.params;
  const doc = await Expense.findOneAndUpdate({ _id: id, userId: req.user.id }, req.body, { new: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
}

export async function deleteExpense(req, res) {
  const { id } = req.params;
  const doc = await Expense.findOneAndDelete({ _id: id, userId: req.user.id });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
}

