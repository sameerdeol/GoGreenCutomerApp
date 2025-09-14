import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit ,ChangeDetectorRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { CartService } from '../services/cart.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { CommonHeaderComponent } from "../components/common-header/common-header.component";

@Component({
  selector: 'app-view-cart',
  templateUrl: './view-cart.page.html',
  styleUrls: ['./view-cart.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent, CommonHeaderComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewCartPage implements OnInit {

  currency = environment.currencySymbol;
  cartItems: any[] = [];
  selectedItems: any = {};
  selectAll: boolean = false;
  totalQuantity: number = 0;
  totalAmount: number = 0;
  images: any;
  selectAllChecked = false;
  baseUrl = environment.baseurl;
  selectedOption: string = 'option1';

  isAddedMap: { [key: string]: boolean } = {};
  activeCart: any[] = [];
  selectedItemMap: { [key: number]: boolean } = {};
  allCartItems: any[] = [];

  selectedDeliveryOption: string = 'Normal'; // default
  deliveryCharge: number = 0;
  userID: any;

  constructor(private router: Router,
    private storage: Storage,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
     private cartService: CartService) { }

  async ngOnInit() {
    const user_id = await this.storage.get('userID');
    this.userID =  user_id; 
  }
  async navigateToCheckout() {
    if (this.getCartTotal() > 0) {
      this.router.navigate(['/checkout'], {
        state: {
          totalPrice: this.getTotalPrice(),
          deliveryOption: this.selectedDeliveryOption
        }
      });
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Cart Empty',
        message: 'Please add item(s) to proceed.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  
  goBack() {
    // this.location.back();
    this.router.navigate(['/home']);
  }
  async ionViewWillEnter() {
    await this.loadCartFromStorage(); 
  }
  async navigateToParticularProduct(product_id: any){
    await this.storage.set('lastProductId', product_id);
    // this.router.navigate(['/product-detail'], {
    //   state: { 
    //          product_id: product_id,     
    //    }
    // });
    this.router.navigate(
    ['/product-detail'], 
    {
      queryParams: { id: product_id },   // ✅ param passed internally
      skipLocationChange: true           // ✅ not visible in URL
    }
  );
  }

  selectOnlyOne(option: string) {
    if (this.selectedOption === option) {
      this.selectedOption = ''; 
    } else {
      this.selectedOption = option; 
    }
  }
  get finalTotal(): number {
    return this.totalAmount + this.deliveryCharge;
  }
  
  async updateTotalWithDelivery() {
    if (this.selectedDeliveryOption === 'Fast') {
      this.deliveryCharge = 3;
    } else {
      this.deliveryCharge = 0;
    }
  }
  // async addToCart(product: any) {
  //   const existingItem = this.cartItems.find(item => item.id === product.id);
  
  //   if (existingItem) {
  //     existingItem.quantity += 1;
  //   } else {
  //     this.cartItems.push({
  //       category_id: product.category_id,
  //       id: product.id,
  //       quantity: 1,
  //       price: product.price,
  //       image: product.featured_image,
  //       title: product.title,
  //       subtitle: product.subtitle
  //     });
  //     // this.activeCart.push({ ...this.cartItems });
  //   }
  
  //   this.isAddedMap[product.id] = true;
  //   this.selectedItemMap[product.id] = true; 
  //   // ✅ Ensure it's in activeCart
  //   const activeIndex = this.activeCart.findIndex(i => i.id === product.id);
  //   if (activeIndex !== -1) {
  //     this.activeCart[activeIndex].quantity += 1;
  //   } else {
  //     const item = this.cartItems.find(i => i.id === product.id);
  //     this.activeCart.push({ ...item });
  //   }
  
  //   await this.storage.set('cartItems', this.cartItems);
    
  //   // Update cart service
  //   this.cartService.setCartItems(this.cartItems);
  
  //   this.updateTotalQuantity();
   
  // }
  async addToCart(product: any) {
  // Find in cartItems
  let existingItem = this.cartItems.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    existingItem = {
      category_id: product.category_id,
      id: product.id,
      quantity: 1,
      price: product.price,
      image: product.featured_image,
      title: product.title,
      subtitle: product.subtitle
    };
    this.cartItems.push(existingItem);
  }

  // ✅ Keep activeCart in sync with cartItems
  const activeIndex = this.activeCart.findIndex(i => i.id === product.id);
  if (activeIndex !== -1) {
    this.activeCart[activeIndex] = { ...existingItem }; // copy updated item
  } else {
    this.activeCart.push({ ...existingItem });
  }

  // Mark UI states
  this.isAddedMap[product.id] = true;
  this.selectedItemMap[product.id] = true;

  // Save to storage
  await this.storage.set('cartItems', this.cartItems);

  // Update cart service
  this.cartService.setCartItems(this.cartItems);

  // Update totals
  this.updateTotalQuantity();
}

  async removeFromCart(product: any) {
    const index = this.cartItems.findIndex(item => item.id === product.id);
  
    if (index !== -1) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity -= 1;

        if (this.selectedItemMap[product.id]) {
          const activeIndex = this.activeCart.findIndex(i => i.id === product.id);
          if (activeIndex !== -1) {
            this.activeCart[activeIndex].quantity = this.cartItems[index].quantity;
          }
        }
  
      } else {
        this.cartItems.splice(index, 1);
        this.isAddedMap[product.id] = false;
        this.activeCart = this.activeCart.filter(i => i.id !== product.id);
        delete this.selectedItemMap[product.id];
      }
  
      await this.storage.set('cartItems', this.cartItems);
      
      // Update cart service
      this.cartService.setCartItems(this.cartItems);
    }
  
    this.updateTotalQuantity();
   
  }
  
  getQuantity(productId: number): number {
    const item = this.cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  }
  async updateTotalQuantity() {
    this.totalQuantity = this.activeCart.reduce((total, item) => total + item.quantity, 0);
    this.totalAmount =  this.activeCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    //  this.totalAmount = this.getCartTotal();
    this.cdr.detectChanges();
  }
  
  async loadCartFromStorage() {
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];
    const storedSelectedMap = await this.storage.get('selectedItemMap') || {};
    this.selectedItemMap = {};
    this.activeCart = [];
    this.isAddedMap = {};
  
    this.cartItems.forEach(item => {
      this.isAddedMap[item.id] = true;

      // agar storage mein value mili toh use karo, warna default true
      const isSelected = storedSelectedMap[item.id] !== undefined ? storedSelectedMap[item.id] : true;
      this.selectedItemMap[item.id] = isSelected;

      if (isSelected) {
        this.activeCart.push({ ...item });
      }
    });
  
    this.selectAll = this.cartItems.length > 0 && this.cartItems.every(i => this.selectedItemMap[i.id]);
  
    // Update cart service with loaded cart items
    this.cartService.setCartItems(this.cartItems);
    
    this.updateTotalQuantity();
   
    console.log('✅ Full cart:', this.cartItems);
    console.log('✅ Active cart:', this.activeCart);
  }
  get formattedTotalAmount(): string {
    return `$${this.totalAmount.toFixed(2)}`;
  }

  async onItemCheckboxChange(item: any) {
    this.activeCart = this.cartItems.filter(i => this.selectedItemMap[i.id]);
    this.selectAll = this.cartItems.length > 0 && this.cartItems.every(i => this.selectedItemMap[i.id]);
    this.updateTotalQuantity();
     await this.storage.set('selectedItemMap', this.selectedItemMap);
    console.log('✅ Active cart updated:', this.activeCart);
  }
  async deleteItemFromCart(product: any) {
    const index = this.cartItems.findIndex(item => item.id === product.id);
    if (index !== -1) {
      this.cartItems.splice(index, 1);

      delete this.selectedItemMap[product.id];
      this.activeCart = this.activeCart.filter(i => i.id !== product.id);
  
      this.isAddedMap[product.id] = false;
      await this.storage.set('cartItems', this.cartItems);
      
      // Update cart service
      this.cartService.setCartItems(this.cartItems);
  
      this.updateTotalQuantity();
     
    }
  }

  async toggleSelectAll() {
    this.activeCart = [];
    for (const item of this.cartItems) {
      this.selectedItemMap[item.id] = this.selectAll;
      if (this.selectAll) {
        this.activeCart.push({ ...item });
      }
    }
     await this.storage.set('selectedItemMap', this.selectedItemMap);
    this.updateTotalQuantity();
   
  }

  navigateToinerAllFeaturesProducts(category_id: any, featuresProduct: any){
    this.router.navigate(['/inner-product-page'], { queryParams: { id: category_id, type: featuresProduct } });
  }

  getItemTotal(item: any): number {
  const basePrice =
    item.variant_price && item.variant_price > 0
      ? item.variant_price
      : item.price;

  const addonsTotal =
    item.addons?.reduce((sum: number, addon: { price: any; }) => sum + parseFloat(addon.price), 0) || 0;

  return (basePrice + addonsTotal) * item.quantity;
  }
 getCartTotal(): number {
    return this.cartItems.reduce((sum, item) => {
      return this.selectedItemMap[item.id] ? sum + this.getItemTotal(item) : sum;
    }, 0);
  }
  async navigateToproduct(id: any){
    await this.storage.set('product_id', id);
    this.router.navigate(['/product-detail']);
  }
  getTotalPrice(): number{
     return this.getCartTotal()+ this.deliveryCharge;;
  }

}
