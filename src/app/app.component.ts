import { Component } from '@angular/core';
import { Router } from '@angular/router';
// import { Storage } from '@capacitor/storage';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { FcmService } from './services/fcm.service';
import { PushNotifications, PushNotificationSchema, ActionPerformed, Token } from '@capacitor/push-notifications';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
  providers: [Storage]
})
export class AppComponent {
  public appPages = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(private router: Router, private platform: Platform,private storage: Storage,private fcm: FcmService) {
    this.init();
    this.initializeApp2();
    this.platform.ready().then(() => {
      this.fcm.initPush();
    }).catch(e => {
      console.log(e);
    });
  }
  async init() {
    await this.storage.create();
  }
  async ngOnInit() {
    const token =  await this.storage.get('auth_token');
    console.log('token in AppComponent:', token);
    if (token) {
      this.router.navigate(['/home']);
    }else{
      this.router.navigate(['/splashscreen']);
    } 
  }
  initializeApp2() {
    PushNotifications.requestPermissions().then(result => {
     
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
        console.log('Push notification permission denied.');
      }
    });
 
 
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ', token.value);
    });
 
 
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ', error);
    });
 
 
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received: ', notification);
    });
 
 
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed: ', notification);
    });
  }
}
