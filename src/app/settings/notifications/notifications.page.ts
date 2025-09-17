
import { CommonModule,Location } from '@angular/common';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonicModule,CommonModule ], // ✅ Import Ionic components
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // ✅ Allow Web Components like <ion-icon>
})
export class NotificationsPage implements OnInit {

  notifications: any[] = [];
  groupedNotifications: { label: string; items: any[] }[] = [];
  loading: boolean = false;
  showUnreadOnly: boolean = true; // true => pass true to API for unread notifications

  constructor(private location: Location, private apiservice: ApiserviceService,private storage: Storage, private router: Router) { 
    this.init();
  }

  async ngOnInit() {
    await this.storage.create();
    this.fetchNotifications();
  }

  async init() {
    await this.storage.create();
  }

  goback(){
    this.location.back();
  }

  onNotificationClick(n: any){
    // Navigate to order tracking when notification is about order updates
    const type = n?.type || n?.data?.type;
    const orderId = n?.data?.order_id || n?.reference_id;
    if (type === 'order_update' && orderId) {
      this.router.navigate(['/order-tracking', orderId]);
      return;
    }
    // Fallback: open generic orders list or do nothing
  }

  async fetchNotifications(event?: any){
    this.loading = true;
    const user_id = await this.storage.get('userID');
    this.apiservice.get_all_notifications(user_id, this.showUnreadOnly).subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response?.data)) {
          this.notifications = response.data;
          this.groupedNotifications = this.groupByDay(this.notifications);
        } else {
          this.notifications = [];
          this.groupedNotifications = [];
        }
      },
      error: () => {
        this.notifications = [];
        this.groupedNotifications = [];
      },
      complete: () => {
        this.loading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  toggleUnreadOnly(showUnread: boolean){
    if (this.showUnreadOnly === showUnread) return;
    this.showUnreadOnly = showUnread;
    this.fetchNotifications();
  }

  private groupByDay(items: any[]): { label: string; items: any[] }[] {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayKey = normalize(today);
    const yesterdayKey = normalize(yesterday);

    const buckets: Record<string, any[]> = {};

    for (const n of items) {
      const dt = new Date(n.created_at);
      const key = normalize(dt);
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(n);
    }

    const sortedKeys = Object.keys(buckets).map(k => Number(k)).sort((a,b)=> b - a);
    const result: { label: string; items: any[] }[] = [];

    for (const key of sortedKeys) {
      let label = '';
      if (key === todayKey) label = 'Today';
      else if (key === yesterdayKey) label = 'Yesterday';
      else label = new Date(key).toLocaleDateString();
      result.push({ label, items: buckets[key] });
    }
    return result;
  }

  timeAgo(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals: { [k: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    for (const unit of Object.keys(intervals)) {
      const value = Math.floor(seconds / intervals[unit]);
      if (value >= 1) return `${value}${unit.charAt(0)} ago`;
    }
    return 'just now';
  }
}
