import { store } from '../store.js';
import { NotificationItem } from '../../src/types.js';

export class NotificationService {
  public getNotifications(userId: string): NotificationItem[] {
    return store.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markAsRead(id: string, userId: string): boolean {
    const notif = store.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  public markAllAsRead(userId: string): void {
    store.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
  }

  public createNotification(
    userId: string,
    type: NotificationItem['type'],
    title: string,
    message: string
  ): NotificationItem {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId,
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false
    };
    store.notifications.unshift(notif);
    return notif;
  }
}

export const notificationService = new NotificationService();
