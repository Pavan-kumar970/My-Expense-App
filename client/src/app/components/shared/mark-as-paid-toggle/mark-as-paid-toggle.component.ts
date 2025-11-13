import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Expense } from '../../../services/expense';

@Component({
  selector: 'app-mark-as-paid-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mark-as-paid-toggle.component.html',
  styleUrls: ['./mark-as-paid-toggle.component.scss']
})
export class MarkAsPaidToggleComponent {
  @Input() id!: string;
  @Input() paid = false;
  @Input() paidAt: string | null = null;
  @Input() resource: 'expense' | 'bill' = 'expense';
  @Output() changed = new EventEmitter<{ paid: boolean; paidAt: string | null }>();

  private busy = false;
  private undoTimer: any = null;
  private debounceUntil = 0;

  constructor(private expenseSvc: Expense) {}

  get ariaChecked(): string { return String(this.paid); }

  onToggle(): void {
    const now = Date.now();
    if (this.busy || now < this.debounceUntil) return;
    this.debounceUntil = now + 1000; // 1s debounce

    const prevPaid = this.paid;
    const prevPaidAt = this.paidAt;

    // optimistic
    this.paid = !this.paid;
    this.paidAt = this.paid ? new Date().toISOString() : null;
    this.changed.emit({ paid: this.paid, paidAt: this.paidAt });
    const undo = this.showSnack(this.paid ? 'Marked as paid' : 'Marked as unpaid');

    const perform = () => {
      if (this.resource === 'expense') {
        this.busy = true;
        this.expenseSvc.patchExpensePaid(this.id, this.paid, this.paidAt).subscribe({
          next: () => { this.busy = false; },
          error: () => {
            this.busy = false;
            // revert on failure
            this.paid = prevPaid;
            this.paidAt = prevPaidAt;
            this.changed.emit({ paid: this.paid, paidAt: this.paidAt });
            this.showSnack('Failed to update. Reverted.');
          }
        });
      }
    };

    // delay API slightly to allow undo to cancel
    this.undoTimer = setTimeout(perform, 300);

    undo.onclick = (e: MouseEvent) => {
      e.preventDefault();
      if (this.undoTimer) clearTimeout(this.undoTimer);
      // revert
      this.paid = prevPaid;
      this.paidAt = prevPaidAt;
      this.changed.emit({ paid: this.paid, paidAt: this.paidAt });
      this.hideSnack(undo);
    };
  }

  private showSnack(message: string): HTMLDivElement & { onclick: (e: MouseEvent) => void } {
    const el = document.createElement('div') as any;
    el.className = 'snackbar';
    el.innerHTML = `${message} <button class="undo" type="button">UNDO</button>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('show'));
    setTimeout(() => this.hideSnack(el), 7000);
    const btn = el.querySelector('button.undo') as HTMLButtonElement;
    btn.addEventListener('click', (e) => el.onclick?.(e as any));
    return el;
  }

  private hideSnack(el: HTMLElement): void {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 200);
  }
}
