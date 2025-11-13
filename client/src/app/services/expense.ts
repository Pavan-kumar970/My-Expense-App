import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Expense as ExpenseModel } from '../models/expense';

@Injectable({
  providedIn: 'root',
})
export class Expense {
  private readonly baseUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getExpenses(): Observable<ExpenseModel[]> {
    return this.http.get<any[]>(`${this.baseUrl}`).pipe(
      map((items) => (items || []).map((x) => ({
        id: x.id || x._id,
        userId: x.userId,
        category: x.category,
        amount: x.amount,
        date: typeof x.date === 'string' ? x.date : new Date(x.date).toISOString(),
        description: x.description,
        paid: !!x.paid,
        paidAt: x.paidAt ? (typeof x.paidAt === 'string' ? x.paidAt : new Date(x.paidAt).toISOString()) : null,
      }) as ExpenseModel)),
      catchError((err) => throwError(() => err))
    );
  }

  addExpense(payload: Omit<ExpenseModel, 'id'>): Observable<ExpenseModel> {
    return this.http.post<any>(`${this.baseUrl}`, payload).pipe(
      map((x) => ({
        id: x.id || x._id,
        userId: x.userId,
        category: x.category,
        amount: x.amount,
        date: typeof x.date === 'string' ? x.date : new Date(x.date).toISOString(),
        description: x.description,
        paid: !!x.paid,
        paidAt: x.paidAt ? (typeof x.paidAt === 'string' ? x.paidAt : new Date(x.paidAt).toISOString()) : null,
      }) as ExpenseModel),
      catchError((err) => throwError(() => err))
    );
  }

  updateExpense(id: string, payload: Partial<Omit<ExpenseModel, 'id'>>): Observable<ExpenseModel> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map((x) => ({
        id: x.id || x._id,
        userId: x.userId,
        category: x.category,
        amount: x.amount,
        date: typeof x.date === 'string' ? x.date : new Date(x.date).toISOString(),
        description: x.description,
        paid: !!x.paid,
        paidAt: x.paidAt ? (typeof x.paidAt === 'string' ? x.paidAt : new Date(x.paidAt).toISOString()) : null,
      }) as ExpenseModel),
      catchError((err) => throwError(() => err))
    );
  }

  patchExpensePaid(id: string, paid: boolean, paidAt: string | null): Observable<ExpenseModel> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, { paid, paidAt }).pipe(
      map((x) => ({
        id: x.id || x._id,
        userId: x.userId,
        category: x.category,
        amount: x.amount,
        date: typeof x.date === 'string' ? x.date : new Date(x.date).toISOString(),
        description: x.description,
        paid: !!x.paid,
        paidAt: x.paidAt ? (typeof x.paidAt === 'string' ? x.paidAt : new Date(x.paidAt).toISOString()) : null,
      }) as ExpenseModel),
      catchError((err) => throwError(() => err))
    );
  }

  deleteExpense(id: string): Observable<{ success: boolean }> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      map(() => ({ success: true })),
      catchError((err) => throwError(() => err))
    );
  }
}
