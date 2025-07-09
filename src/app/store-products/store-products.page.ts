import { SubCategoriesPage } from './../sub-categories/sub-categories.page';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule,Location } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.page.html',
  styleUrls: ['./store-products.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StoreProductsPage implements OnInit {

  allProducts: any[]=[];
  baseUrl = environment.baseurl;
  isAddedMap: { [key: string]: boolean } = {}; 
  totalQuantity: number = 0;
  totalAmount: number = 0;
  cartItems: any[] = [];
  showCartPopup: boolean = false;
  isSlidingOut = false;

  currency = environment.currencySymbol;

  constructor(private router: Router, private apiservice: ApiserviceService,private route: ActivatedRoute,private storage: Storage,private location : Location) { 
    this.init();
  }
  async init() {
    await this.storage.create();
  }
  goback(){
    this.location.back();
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const vendor_id = params['id'];
      console.log('Vendor ID:', vendor_id);
      this.getAllProductsByVendor(vendor_id)
    });
  }

  async ionViewWillEnter() {
    await this.loadCartFromStorage(); 
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];
  
    this.totalQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Show popup if there are items in the cart
    this.showCartPopup = this.totalQuantity > 0;
   
  }
  async loadCartFromStorage() {
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];
    this.updateTotalQuantity();
  
    // Update isAddedMap
    this.isAddedMap = {};
    this.cartItems.forEach(item => {
      this.isAddedMap[item.id] = true;
    });
    // if (this.cartItems.length === 0) {
    //   this.showCartPopup = false;
    // }
    console.log('🛒 Cart loaded from storage:', this.cartItems);
  }
  navigateToViewCart(){
    this.router.navigate(['/view-cart']);
  }
  updateTotalQuantity() {
    this.totalQuantity = this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
  getAllProductsByVendor(vendor_id: any){
    const searchTerm = "";
    this.apiservice.get_allproductsByVendorID(vendor_id, searchTerm).subscribe((response)=>{
      if(response.success == true){
         this.allProducts = response.product;
         console.log("all vendor products",this.allProducts)
      }
    })
  }

  async addToCart(product: any) {
    const existingItem = this.cartItems.find(item => item.id === product.id);
     console.log('product title',product.title)
     console.log('product subtitle',product.subtitle)
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        category_id: product.category_id,
        id: product.id,
        quantity: 1,
        price: product.price,
        image: product.featured_image,
        title: product.title, // 👈 add name
        subtitle: product.subtitle, 
      });
    }
    this.showPopup();
    this.updateTotalQuantity();
    // this.showPopup();
    this.isAddedMap[product.id] = true;
    await this.storage.set('cartItems', this.cartItems);
    console.log('🛒 Added:', this.cartItems);
  }

  async removeFromCart(product: any) {
    const index = this.cartItems.findIndex(item => item.id === product.id);
  
    if (index !== -1) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity -= 1;
      } else {
        this.cartItems.splice(index, 1);
        this.isAddedMap[product.id] = false;
      }
  
      await this.storage.set('cartItems', this.cartItems);
      console.log('❌ Removed:', this.cartItems);
    }
    if (this.cartItems.length === 0) {
      this.showCartPopup = false;
    }
    this.updateTotalQuantity();

  }
  showPopup() {
    this.showCartPopup = true;
  }
  getQuantity(productId: number): number {
    const item = this.cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  }
  async removeCartStorage() {
    this.isSlidingOut = true;

    setTimeout(async () => {
      await this.storage.remove('cartItems');
      this.cartItems.forEach(item => {
        // Set isAddedMap to true for each item
        this.isAddedMap[item.id] = false;
      });
      this.cartItems = [];
      this.showCartPopup = false;
      this.isSlidingOut = false;
    }, 400);
  }
}
