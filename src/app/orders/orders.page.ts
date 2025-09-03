
import { CommonModule,Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiserviceService } from '../services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { CommonHeaderComponent } from "../components/common-header/common-header.component";
@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, CommonHeaderComponent], // ✅ Import Ionic components
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // ✅ Allow Web Components like <ion-icon>
})
export class OrdersPage implements OnInit {
  filters=  ['All Orders', 'Delivered', 'Shipped', 'Processing'];

  Orders: any[]= [];
  
  // This object will track which accordions are open, keyed by order_id
  openAccordions: { [orderId: string]: boolean } = {};

  // Toggle the open/close state for a specific accordion

  selectedFilter: string = '';

  constructor(private apiservice: ApiserviceService,
    private storage: Storage,
    private router: Router) {
     this.init();
   }

  async ngOnInit() {
     this.selectedFilter = this.filters[0];
       const user_id = await this.storage.get('userID');
       console.log('user_id',user_id)
        this.getAllOrders(user_id);
  }
    async init() {
    await this.storage.create();
  }

  OnFilterClick(filter: string){
    this.selectedFilter = filter;
  }
  onClickViewDetails(order: any){
      this.router.navigate(['/view-order-details'], {
      state: { order: order }
    });
  }

  getAllOrders(user_id: any){
    this.apiservice.get_all_orders(user_id).subscribe((response)=>{
      if(response){
        this.Orders = response.orders;
        console.log("All Orders", response)
      }
    })
  }


}
