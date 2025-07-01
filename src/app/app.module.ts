import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
 
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
 
import { PushNotificationsPlugin } from '@capacitor/push-notifications';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { addIcons } from 'ionicons';
import {
  bookmarkSharp,
  warningSharp,
  trashSharp,
  archiveOutline,
  heartOutline,
  heartSharp,
  mailSharp,
  paperPlaneSharp,
  archiveSharp
} from 'ionicons/icons';
 
addIcons({
  'bookmark-sharp': bookmarkSharp,
  'warning-sharp': warningSharp,
  'trash-sharp': trashSharp,
  'archive-outline': archiveOutline,
  'heart-outline': heartOutline,
  'heart-sharp': heartSharp,
  'mail-sharp': mailSharp,
  'paper-plane-sharp': paperPlaneSharp,
  'archive-sharp': archiveSharp
});
 
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireMessagingModule,
    AngularFireAuthModule,
    
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: Diagnostic, useClass: Diagnostic }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}