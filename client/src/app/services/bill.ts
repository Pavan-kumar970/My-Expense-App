import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Bill as BillModel } from '../models/bill';

@Injectable({
  providedIn: 'root',
})
export class Bill {
  private readonly baseUrl = `${environment.apiUrl}/bills`;

  constructor(private http: HttpClient) {}

  getBills(): Observable<BillModel[]> {
    return this.http.get<any[]>(`${this.baseUrl}`).pipe(
      map((items) => (items || []).map((x) => ({
        id: x.id || x._id,
        userId: x.userId,
        name: x.name,
        amount: x.amount,
        dueDate: typeof x.dueDate === 'string' ? x.dueDate : new Date(x.dueDate).toISOString(),
        recurring: !!x.recurring,
      }) as BillModel)),
      catchError((err) => throwError(() => err))
    );
  }

  addBill(payload: Omit<BillModel, 'id'>): Observable<BillModel> {
    return this.http.post<any>(`${this.baseUrl}`, payload).pipe(
      map((x) => ({
        id: x.id || x._id,
        userId: x.userId,
        name: x.name,
        amount: x.amount,
        dueDate: typeof x.dueDate === 'string' ? x.dueDate : new Date(x.dueDate).toISOString(),
        recurring: !!x.recurring,
      }) as BillModel),
      catchError((err) => throwError(() => err))
    );
  }

  updateBill(id: string, payload: Partial<Omit<BillModel, 'id'>>): Observable<BillModel> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map((x) => ({
        id: x.id || x._id,
        userId: x.userId,
        name: x.name,
        amount: x.amount,
        dueDate: typeof x.dueDate === 'string' ? x.dueDate : new Date(x.dueDate).toISOString(),
        recurring: !!x.recurring,
      }) as BillModel),
      catchError((err) => throwError(() => err))
    );
  }

  deleteBill(id: string): Observable<{ success: boolean }> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      map(() => ({ success: true })),
      catchError((err) => throwError(() => err))
    );
  }
}
