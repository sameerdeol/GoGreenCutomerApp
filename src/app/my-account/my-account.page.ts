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
import { CommonHeaderComponent } from "../components/common-header/common-header.component";
register();

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
  standalone: true,
    imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent, CommonHeaderComponent], 
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyAccountPage implements OnInit {

  quickLinkData = [
    [
      { icon: 'cube-outline', label: 'Orders', route: '/orders' },
      { icon: 'heart-outline', label: 'Wishlist', route: '/whishlist' },
    ],
    [
      { icon: 'person-outline', label: 'Profile', route: '/profile' },
      { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
    ]
  ];
  constructor(private router: Router,private alertCtrl: AlertController,private storage: Storage, private location: Location) { 
    this.init();
  }
  async init() {
    await this.storage.create();
  }
  ngOnInit() {
  }
 
  AllAddress(){
    this.router.navigate(['/all-address']);
  }
  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
  navigateToProfile(){
    this.router.navigate(['/profile']);
  }
  navigateTowishlist(){
    this.router.navigate(['/whishlist']);
  }
  navigateToOrders(){
    this.router.navigate(['/orders'])
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
