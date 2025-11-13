import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
})
export class Settings {
  loading = false;
  error = '';
  user: { id: string; name: string; email: string } | null = null;

  constructor(private auth: Auth) {
    this.fetchMe();
  }

  private fetchMe(): void {
    this.loading = true;
    this.error = '';
    this.auth.me().subscribe({
      next: (res) => {
        this.user = res.user;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load profile';
        this.loading = false;
      }
    });
  }
}
