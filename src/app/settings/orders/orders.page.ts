import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiserviceService } from '../../services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { CommonHeaderComponent } from "../../components/common-header/common-header.component";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CommonHeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrdersPage implements OnInit {
  filters = ['All Orders', 'Delivered', 'Cancelled'];   // you can add 'Pending' here if needed
  Orders: any[] = [];
  PickDropOrders: any[] = [];
  selectedFilter: string = '';
  selectedCategory: 'shop' | 'pickdrop' = 'shop';

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
    this.getAllPickAndDropAddress(user_id);
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
  if (status === 1) return 'Confirmed';
  if (status === 2) return 'Out for Delivery';
  if (status === 3) return 'Cancelled';
  return '';
}
  onClickViewDetails(order: any) {
    this.router.navigate(['/view-order-details'], {
      state: { order: order }
    });
  }
  onClickPickDropDetails(order: any){
    if(order?.id){
      this.router.navigate(['/parcel-detail', order.id]);
    }
  }
  getAllPickAndDropAddress(user_id: any){
    this.apiservice.get_all_pick_and_drop_orders(user_id).subscribe((response)=>{
      if(response){
        // Normalize pick & drop orders into a simple structure the UI can render
        const list = (response.parcels || response.data || response.orders || []).map((p: any) => ({
          id: p.id,
          orderType: 'pickdrop',
          order_uid: p.parcel_uid || p.id || p.reference || 'P&D',
          created_at: p.created_at || p.createdAt || p.date || new Date().toISOString(),
          status: p.status ?? p.order_status ?? 0,
          pickup: p.pickup || p.pick_up || { address: p.pickup_address || p.pickUpAddress },
          drop: p.drop || p.drop_off || { address: p.drop_address || p.dropAddress },
          total_price: p.total_price || p.price || p.amount || null
        }));
        this.PickDropOrders = list;
        console.log('Pick & Drop Orders', this.PickDropOrders);
      }
    })
  }
  getAllOrders(user_id: any) {
    this.apiservice.get_all_orders(user_id).subscribe((response) => {
      if (response) {
        this.Orders = response.orders;
        console.log("All Orders", response);
      }
    });
  }

  // Merge normal and pick&drop orders for display
  get mergedOrders() {
    return [
      ...this.Orders.map(o => ({ ...o, orderType: 'normal' })),
      ...this.PickDropOrders
    ];
  }

  // ✅ Filtered Orders based on selected category and status filter
  get filteredOrders() {
    const base = this.selectedCategory === 'shop'
      ? this.mergedOrders.filter(order => order.orderType === 'normal')
      : this.mergedOrders.filter(order => order.orderType === 'pickdrop');

    if (this.selectedCategory === 'pickdrop') {
      // Status filters do not apply to Pick & Drop for now
      return base;
    }

    if (this.selectedFilter === 'All Orders') {
      return base;
    }
    if (this.selectedFilter === 'Delivered') {
      return base.filter(order => order.order_status === 1);
    }
    if (this.selectedFilter === 'Cancelled') {
      return base.filter(order => order.order_status === 3);
    }
    return base;
  }
}
