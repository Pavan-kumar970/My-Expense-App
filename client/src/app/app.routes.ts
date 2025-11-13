import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { ExpenseList } from './components/expenses/expense-list/expense-list';
import { BillReminder } from './components/bills/bill-reminder/bill-reminder';
import { Settings } from './components/settings/settings';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'register' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'expenses', component: ExpenseList, canActivate: [authGuard] },
  { path: 'bills', component: BillReminder, canActivate: [authGuard] },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
  { path: '**', redirectTo: 'register' }
];
