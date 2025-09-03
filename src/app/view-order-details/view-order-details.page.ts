import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonHeaderComponent } from '../components/common-header/common-header.component';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrderProductModalComponent } from '../components/order-product-modal/order-product-modal.component';
import { CartService } from '../services/cart.service';
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
  isAddedMap: { [key: string]: boolean } = {};
  constructor(private router: Router,
              private modalController: ModalController,
                private cartService: CartService,
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
 
async buyAgain() {
  let cartItems = (await this.storage.get('cartItems')) || [];

  // Vendor check: clear cart if vendors differ
  if (cartItems.length > 0) {
    const firstVendor = cartItems[0].vendor_id;
    if (this.order.vendor_id !== firstVendor) {
      cartItems = [];
    }
  }

  this.order.products.forEach((product: any, index: number) => {
    const productId = product.id ?? `${this.order.order_id}-${index}`; // Use real ID if available
    const existing = cartItems.find((item: any) => item.id === productId);

    if (existing) {
      existing.quantity += product.product_quantity;
    } else {
      cartItems.push({
        vendor_id: this.order.vendor_id,
        category_id: null,
        id: productId,
        quantity: product.product_quantity,
        price: parseFloat(product.single_item_price),
        image: product.featured_image,
        title: product.product_name,
        subtitle: ''
      });
    }

    // ✅ Mark as added in CartService map
    this.cartService.isAddedMap[productId] = true;
  });

  // Save to storage
  await this.storage.set('cartItems', cartItems);

  // Update CartService (notifies subscribers, e.g., StoreProductsPage)
  this.cartService.setCartItems(cartItems);

  console.log('🛒 Buy Again cart:', cartItems);
}



}
