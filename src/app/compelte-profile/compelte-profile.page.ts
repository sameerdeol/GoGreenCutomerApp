import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
// import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
register();
@Component({
  selector: 'app-compelte-profile',
  templateUrl: './compelte-profile.page.html',
  styleUrls: ['./compelte-profile.page.scss'],
   standalone: true,
    imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CompelteProfilePage implements OnInit {

  bannerImg: any;
  baseUrl = environment.baseurl;
  constructor(private apiservice: ApiserviceService) { }

  ngOnInit() {
  }

}
