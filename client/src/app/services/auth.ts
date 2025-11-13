import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly tokenKey = 'auth_token';
  private readonly baseUrl = environment.apiUrl;

  isAuthenticated(): boolean {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem(this.tokenKey);
  }

  me(): Observable<{ user: { id: string; name: string; email: string } }> {
    return this.http
      .get<{ user: { id: string; name: string; email: string } }>(`${this.baseUrl}/auth/me`)
      .pipe(catchError((err) => throwError(() => err)));
  }

  getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(this.tokenKey) : null;
  }

  constructor(private http: HttpClient) {}

  // Register a new user. Server responds with { message, user } and DOES NOT issue a token.
  register(email: string, password: string, name?: string): Observable<{ message: string; user: any }> {
    const body: any = { email, password };
    if (name) body.name = name;
    return this.http
      .post<{ message: string; user: any }>(`${this.baseUrl}/auth/register`, body)
      .pipe(
        catchError((err) => throwError(() => err))
      );
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap((res: { token: string }) => this.storeToken(res.token)),
        catchError((err) => throwError(() => err))
      );
  }

  private storeToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }
}
