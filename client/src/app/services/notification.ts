import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  async requestPermission(): Promise<NotificationPermission | undefined> {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          return await Notification.requestPermission();
        }
        return Notification.permission;
      }
    } catch {}
    return undefined;
  }

  notify(title: string, options?: globalThis.NotificationOptions): void {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(title, options);
        return;
      }
    } catch {}
    // Fallback
    // eslint-disable-next-line no-alert
    alert(title);
  }
}
