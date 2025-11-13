import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Expense } from '../../../services/expense';
import { Expense as ExpenseModel } from '../../../models/expense';
import { MarkAsPaidToggleComponent } from '../../shared/mark-as-paid-toggle/mark-as-paid-toggle.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, MarkAsPaidToggleComponent],
  templateUrl: './expense-list.html',
  styleUrls: ['./expense-list.scss'],
})
export class ExpenseList {
  form: FormGroup;
  loading = false;
  error = '';
  items: ExpenseModel[] = [];
  editingId: string | null = null;

  constructor(private fb: FormBuilder, private expense: Expense) {
    this.form = this.fb.group({
      category: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      description: ['']
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.expense.getExpenses().subscribe({
      next: (data) => {
        this.items = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load expenses';
        this.loading = false;
      }
    });
  }

  add(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = { ...this.form.value } as Omit<ExpenseModel, 'id'>;
    this.expense.addExpense(payload).subscribe({
      next: () => {
        this.form.reset();
        this.load();
      },
      error: (err) => (this.error = err?.error?.error || 'Failed to add expense')
    });
  }

  remove(id: string): void {
    this.expense.deleteExpense(id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err?.error?.error || 'Failed to delete expense')
    });
  }

  onPaidChanged(e: { paid: boolean; paidAt: string | null }, item: ExpenseModel): void {
    item.paid = e.paid;
    item.paidAt = e.paidAt;
  }
}
