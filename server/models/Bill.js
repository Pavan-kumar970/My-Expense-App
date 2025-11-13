import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    recurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Bill = mongoose.model('Bill', billSchema);
