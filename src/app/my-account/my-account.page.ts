import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
// import { HeaderComponent } from '../components/header/header.component';
import { CommonModule, Location } from '@angular/common';
import { register } from 'swiper/element/bundle';
// import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
register();

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
  standalone: true,
    imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyAccountPage implements OnInit {

  constructor(private router: Router,private alertCtrl: AlertController,private storage: Storage, private location: Location) { 
    this.init();
  }
  async init() {
    await this.storage.create();
  }
  ngOnInit() {
  }
  navigateToProfile(){
    this.router.navigate(['/profile']);
  }
  navigateTowishlist(){
    this.router.navigate(['/whishlist']);
  }
  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Logout',
          handler: async () => {
            await this.logout();
          },
        },
      ],
    });

    await alert.present();
  }

  async logout() {
    await this.storage.clear();
    this.router.navigate(['/welcome-one']);
  }
  goback(){
    this.location.back();
  }
}
