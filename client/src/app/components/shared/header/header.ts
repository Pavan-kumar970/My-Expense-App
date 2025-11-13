import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  panelOpen = false;
  user: { id: string; name: string; email: string } | null = null;
  theme: 'light' | 'dark' = (typeof localStorage !== 'undefined' && (localStorage.getItem('theme') as 'light' | 'dark')) || 'light';
  notifications = typeof localStorage !== 'undefined' ? localStorage.getItem('notifications') === 'true' : true;
  currency = (typeof localStorage !== 'undefined' && (localStorage.getItem('currency') || 'USD')) || 'USD';

  constructor(private auth: Auth, private router: Router) {
    this.auth.me().subscribe({
      next: (res) => (this.user = res.user),
      error: () => (this.user = null)
    });
    this.applyTheme();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  applyTheme(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', this.theme);
    }
  }

  saveSettings(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', this.theme);
      localStorage.setItem('notifications', String(this.notifications));
      localStorage.setItem('currency', this.currency);
    }
    this.applyTheme();
    // Simple confirmation toast
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-alert
      alert('Settings saved');
    }
    this.panelOpen = false;
  }
}
