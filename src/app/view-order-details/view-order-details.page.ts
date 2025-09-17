import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonHeaderComponent } from '../components/common-header/common-header.component';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
@Component({
  selector: 'app-view-order-details',
  templateUrl: './view-order-details.page.html',
  styleUrls: ['./view-order-details.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent, CommonHeaderComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewOrderDetailsPage implements OnInit {
  order: any;
  constructor(private router: Router,
              private storage: Storage,

  ) { 
    this.init();
  }
  async init() {
    await this.storage.create();
  }
  ngOnInit() {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras?.state) {
        this.order = navigation.extras.state['order'];
  
    
        console.log("order",this.order)
      }
  }

}
