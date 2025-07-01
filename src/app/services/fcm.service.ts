import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { StorageService } from './storage.service';



export const FCM_TOKEN = 'push_notification_token';


@Injectable({
  providedIn: 'root'
})
export class FcmService {


  constructor(private storage: StorageService) {}


  async initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      await this.registerPush();
    }
  }


  private async registerPush() {
    try {
      await this.addListeners();
      let permStatus = await PushNotifications.checkPermissions();


      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }


      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions');
      }


      await PushNotifications.register();
    } catch (e) {
      console.log(e);
    }
  }


  private async addListeners() {
    PushNotifications.addListener('registration', async (token: Token) => {
      const fcmToken = token.value;
      // console.log('fcmToken : ',fcmToken);
      await this.storage.setStorage(FCM_TOKEN, JSON.stringify(fcmToken));
      // this.sendTokenToBackend(fcmToken);
    });


    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error: ' + JSON.stringify(error));
    });


    // Other listeners...
  }


  async getToken(): Promise<string | null> {
    const savedToken = await this.storage.getStorage(FCM_TOKEN);
    return savedToken ? JSON.parse(savedToken.value) : null;
  }


  async removeFcmToken() {
    try {
      await this.storage.removeStorage(FCM_TOKEN);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
