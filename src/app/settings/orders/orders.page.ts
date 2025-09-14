import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiserviceService } from '../../services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { CommonHeaderComponent } from "../../components/common-header/common-header.component";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, CommonHeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrdersPage implements OnInit {
  filters = ['All Orders', 'Delivered', 'Cancelled'];   // you can add 'Pending' here if needed
  Orders: any[] = [];
  selectedFilter: string = '';

  constructor(
    private apiservice: ApiserviceService,
    private storage: Storage,
    private router: Router
  ) {
    this.init();
  }

  async ngOnInit() {
    this.selectedFilter = this.filters[0]; // Default = All Orders
    const user_id = await this.storage.get('userID');
    console.log('user_id', user_id);
    this.getAllOrders(user_id);
  }

  async init() {
    await this.storage.create();
  }

  doRefresh(event: any) {
    const user_id = localStorage.getItem('user_id');
    this.getAllOrders(user_id);
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  OnFilterClick(filter: string) {
    this.selectedFilter = filter;
  }
  getOrderStatusText(status: number | null | undefined): string {
  if (status == null || status === 0) return 'Pending';
  if (status === 1) return 'Delivered';
  if (status === 3) return 'Cancelled';
  return '';
}
  onClickViewDetails(order: any) {
    this.router.navigate(['/view-order-details'], {
      state: { order: order }
    });
  }

  getAllOrders(user_id: any) {
    this.apiservice.get_all_orders(user_id).subscribe((response) => {
      if (response) {
        this.Orders = response.orders;
        console.log("All Orders", response);
      }
    });
  }

  // ✅ Filtered Orders based on selected filter
  get filteredOrders() {
    if (this.selectedFilter === 'All Orders') {
      return this.Orders;
    }
    if (this.selectedFilter === 'Delivered') {
      return this.Orders.filter(order => order.order_status === 1);
    }
    if (this.selectedFilter === 'Cancelled') {
      return this.Orders.filter(order => order.order_status === 3);
    }
    return this.Orders;
  }
}
