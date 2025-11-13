export interface Bill {
  id: string;
  userId: string;
  name: string;
  dueDate: string; // ISO string
  amount: number;
  recurring: boolean;
  paid?: boolean;
  paidAt?: string | null;
}
