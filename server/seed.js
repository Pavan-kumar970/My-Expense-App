import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Expense } from './models/Expense.js';
import { Bill } from './models/Bill.js';

export async function run() {
  await connectDB();
  console.log('Seeding data...');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Expense.deleteMany({}),
    Bill.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await User.create({
    name: 'Demo User',
    email: 'demo@example.com',
    passwordHash,
  });

  const now = new Date();
  await Expense.create([
    { userId: user._id, category: 'Food', amount: 25.5, date: now, description: 'Lunch' },
    { userId: user._id, category: 'Transport', amount: 120, date: now, description: 'Fuel' },
    { userId: user._id, category: 'Shopping', amount: 60, date: now, description: 'Groceries' },
  ]);

  await Bill.create([
    { userId: user._id, name: 'Electricity', amount: 70, dueDate: now, recurring: true },
    { userId: user._id, name: 'Internet', amount: 40, dueDate: now, recurring: true },
  ]);

  console.log('Seed complete');
  console.log('Demo credentials -> email: demo@example.com, password: password123');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  run().then(() => process.exit(0)).catch(() => process.exit(1));
}
