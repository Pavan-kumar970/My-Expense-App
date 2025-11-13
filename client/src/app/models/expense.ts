export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  date: string; // ISO string
  description?: string;
  paid?: boolean;
  paidAt?: string | null;
}
