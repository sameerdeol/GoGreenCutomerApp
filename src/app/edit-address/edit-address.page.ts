import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
register();
@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.page.html',
  styleUrls: ['./edit-address.page.scss'],
    standalone: true,
    imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditAddressPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
