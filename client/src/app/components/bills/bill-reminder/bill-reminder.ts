import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Bill } from '../../../services/bill';
import { Bill as BillModel } from '../../../models/bill';
import { MarkAsPaidToggleComponent } from '../../shared/mark-as-paid-toggle/mark-as-paid-toggle.component';

@Component({
  selector: 'app-bill-reminder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, NgClass, MarkAsPaidToggleComponent],
  templateUrl: './bill-reminder.html',
  styleUrls: ['./bill-reminder.scss'],
})
export class BillReminder {
  form: FormGroup;
  items: BillModel[] = [];
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private bill: Bill) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      dueDate: ['', Validators.required],
      recurring: [false]
    });
    this.load();
  }

  private sortByDueDate(list: BillModel[]): BillModel[] {
    return [...list].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  load(): void {
    this.loading = true;
    this.bill.getBills().subscribe({
      next: (data) => {
        this.items = this.sortByDueDate(data || []);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load bills';
        this.loading = false;
      }
    });
  }

  add(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = { ...this.form.value } as Omit<BillModel, 'id'>;
    this.bill.addBill(payload).subscribe({
      next: () => {
        this.form.reset({ recurring: false });
        this.load();
      },
      error: (err) => (this.error = err?.error?.error || 'Failed to add bill')
    });
  }

  remove(id: string): void {
    this.bill.deleteBill(id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err?.error?.error || 'Failed to delete bill')
    });
  }

  isUpcoming(dueDate: string): boolean {
    const now = new Date();
    const in7 = new Date();
    in7.setDate(now.getDate() + 7);
    const d = new Date(dueDate);
    return d >= now && d <= in7;
  }

  onPaidChanged(e: { paid: boolean; paidAt: string | null }, item: BillModel): void {
    // UI-only toggle for bills
    item.paid = e.paid;
    item.paidAt = e.paidAt;
  }
}
