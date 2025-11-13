import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Expense } from '../../services/expense';
import { Bill } from '../../services/bill';
import { Expense as ExpenseModel } from '../../models/expense';
import { Bill as BillModel } from '../../models/bill';
import { SpendingByCategoryChartComponent, CategorySlice } from './spending-by-category-chart/spending-by-category-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SpendingByCategoryChartComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard {
  expenses: ExpenseModel[] = [];
  bills: BillModel[] = [];
  loading = false;
  error = '';
  showUpcomingModal = false;
  monthSlices: CategorySlice[] = [];
  monthTotal = 0;

  constructor(private expenseSvc: Expense, private billSvc: Bill) {
    this.load();
  }

  private isWithin7Days(dateIso: string): boolean {
    const now = new Date();
    const in7 = new Date();
    in7.setDate(now.getDate() + 7);
    const d = new Date(dateIso);
    return d >= now && d <= in7;
  }

  get totalExpenses(): number {
    return this.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }

  get upcomingBillsCount(): number {
    return this.bills.filter((b) => this.isWithin7Days(b.dueDate)).length;
  }

  get upcomingBills(): BillModel[] {
    return this.bills.filter((b) => this.isWithin7Days(b.dueDate));
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.expenseSvc.getExpenses().subscribe({
      next: (ex: ExpenseModel[]) => {
        this.expenses = ex || [];
        this.computeMonthSlices();
        this.billSvc.getBills().subscribe({
          next: (b: BillModel[]) => {
            this.bills = b || [];
            this.loading = false;
          },
          error: (err: any) => {
            this.error = err?.error?.error || 'Failed to load bills';
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        this.error = err?.error?.error || 'Failed to load expenses';
        this.loading = false;
      }
    });
  }

  private computeMonthSlices(): void {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const inMonth = this.expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
    // Fallback: if no current-month data, use last 30 days; if still none, use all
    let source = inMonth;
    if (!source.length) {
      const days30 = new Date();
      days30.setDate(now.getDate() - 30);
      source = this.expenses.filter((e) => new Date(e.date) >= days30);
      if (!source.length) source = this.expenses;
    }
    const map = new Map<string, { total: number; count: number }>();
    source.forEach((e) => {
      const key = e.category || 'Uncategorized';
      const cur = map.get(key) || { total: 0, count: 0 };
      cur.total += Number(e.amount) || 0;
      cur.count += 1;
      map.set(key, cur);
    });
    const arr: CategorySlice[] = Array.from(map.entries()).map(([label, v]) => ({ label, total: v.total, count: v.count }));
    arr.sort((a, b) => b.total - a.total);
    const top = arr.slice(0, 6);
    const rest = arr.slice(6);
    if (rest.length) {
      const otherTotal = rest.reduce((s, r) => s + r.total, 0);
      const otherCount = rest.reduce((s, r) => s + r.count, 0);
      top.push({ label: 'Other', total: otherTotal, count: otherCount });
    }
    this.monthSlices = top;
    this.monthTotal = source.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  }

  onCategorySelected(label: string): void {
    // Navigate to expenses with optional filter via query param
    // Keeping RouterLink in template for other actions
  }

  openUpcomingModal(): void {
    if (this.upcomingBillsCount > 0) this.showUpcomingModal = true;
  }

  closeUpcomingModal(): void {
    this.showUpcomingModal = false;
  }
}
