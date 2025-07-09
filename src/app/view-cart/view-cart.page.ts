import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit ,ChangeDetectorRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-view-cart',
  templateUrl: './view-cart.page.html',
  styleUrls: ['./view-cart.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
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
  allfeaturesproducts: any;

  allweeklydeals: any;
  constructor(private router: Router,private storage: Storage, private apiservice: ApiserviceService,private cdr: ChangeDetectorRef) { }

  async ngOnInit() {
    const user_id = await this.storage.get('userID');
    this.userID =  user_id;
    await this.storage.set('selectedDeliveryOption', this.selectedDeliveryOption);
    this.getAllFeaturesProducts();
    this.getAllweeklyDeals();
  }
  navigateToCheckout(){
     this.router.navigate(['/checkout'])
  }
 
  goBack() {
    // this.location.back();
    this.router.navigate(['/home']);
  }
  async ionViewWillEnter() {
    await this.loadCartFromStorage(); 
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
    await this.storage.set('totalAmountWithDeleveryCharges', this.finalTotal.toFixed(2) );
    await this.storage.set('selectedDeliveryOption', this.selectedDeliveryOption);
  }
  async addToCart(product: any) {
    const existingItem = this.cartItems.find(item => item.id === product.id);
  
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        category_id: product.category_id,
        id: product.id,
        quantity: 1,
        price: product.price,
        image: product.featured_image,
        title: product.title,
        subtitle: product.subtitle
      });
      // this.activeCart.push({ ...this.cartItems });
    }
  
    this.isAddedMap[product.id] = true;
    this.selectedItemMap[product.id] = true; 
    // ✅ Ensure it's in activeCart
    const activeIndex = this.activeCart.findIndex(i => i.id === product.id);
    if (activeIndex !== -1) {
      this.activeCart[activeIndex].quantity += 1;
    } else {
      const item = this.cartItems.find(i => i.id === product.id);
      this.activeCart.push({ ...item });
    }
  
    await this.storage.set('cartItems', this.cartItems);
  
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
    }
  
    this.updateTotalQuantity();
   
  }
  
  getQuantity(productId: number): number {
    const item = this.cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  }
  async updateTotalQuantity() {
    this.totalQuantity = this.activeCart.reduce((total, item) => total + item.quantity, 0);
    this.totalAmount = this.activeCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    // console.log('activecart-',this.activeCart)
    //  console.log('totalamount on update', this.totalAmount)
    await this.storage.set('totalAmountWithDeleveryCharges', this.totalAmount.toFixed(2) );
    this.cdr.detectChanges();
  }
  
  async loadCartFromStorage() {
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];
  
    this.selectedItemMap = {};
    this.activeCart = [];
    this.isAddedMap = {};
  
    this.cartItems.forEach(item => {
      this.selectedItemMap[item.id] = true; 
      this.isAddedMap[item.id] = true;
      this.activeCart.push({ ...item });   
    });
  
    this.selectAll = this.cartItems.length > 0 && this.cartItems.every(i => this.selectedItemMap[i.id]);
  
    this.updateTotalQuantity();
   
    console.log('✅ Full cart:', this.cartItems);
    console.log('✅ Active cart:', this.activeCart);
  }
  get formattedTotalAmount(): string {
    return `$${this.totalAmount.toFixed(2)}`;
  }

  onItemCheckboxChange(item: any) {
    this.activeCart = this.cartItems.filter(i => this.selectedItemMap[i.id]);
    this.selectAll = this.cartItems.length > 0 && this.cartItems.every(i => this.selectedItemMap[i.id]);
    this.updateTotalQuantity();
   
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
  
      this.updateTotalQuantity();
     
    }
  }

  async saveForLater(product: any) {
    const isAlreadyFavourite = this.allfeaturesproducts.some(
      (p: any) => p.id === product.id && p.is_favourite === 1
    );
    console.log('isAlreadyFavourite',isAlreadyFavourite)
    if (!isAlreadyFavourite) {
      this.markfavourite(product.id);
    } else {
      console.log('Already in favourites, skipping API call.');
    }
  
    const index = this.cartItems.findIndex(item => item.id === product.id);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
      delete this.selectedItemMap[product.id];
      this.activeCart = this.activeCart.filter(i => i.id !== product.id);
      this.isAddedMap[product.id] = false;
  
      await this.storage.set('cartItems', this.cartItems);
      this.updateTotalQuantity();
     
    }
  }
  
  toggleSelectAll() {
    this.activeCart = [];
    for (const item of this.cartItems) {
      this.selectedItemMap[item.id] = this.selectAll;
      if (this.selectAll) {
        this.activeCart.push({ ...item });
      }
    }
  
    this.updateTotalQuantity();
   
  }

  navigateToinerAllFeaturesProducts(category_id: any, featuresProduct: any){
    this.router.navigate(['/inner-product-page'], { queryParams: { id: category_id, type: featuresProduct } });
  }
  getAllFeaturesProducts(){
    const userID = this.userID;
    this.apiservice.get_all_features_product(userID).subscribe((response)=>{
      if(response){
        this.allfeaturesproducts = response.data;
        console.log('featured', this.allfeaturesproducts)
        // this.isLoading = false;
      }
      
    })
  }

  toggleFavoritefeatured(features_product: any, product_id: any, is_favourite: any): void {
    features_product.is_favourite = features_product.is_favourite === 1 ? 0 : 1;
    if (features_product.is_favourite === 1) {
      this.markfavourite(product_id);
    } else {
      this.unmarkfavourite(product_id);
    }
  }
  async navigateToproduct(id: any){
    await this.storage.set('product_id', id);
    this.router.navigate(['/product-detail']);
  }
  
  markfavourite(product_id: any){
    const user_id = this.userID;
    this.apiservice.add_to_favourties(user_id,product_id).subscribe((response: any) => {  
      if(response){
        // console.log('Favorite API Response-',response)
      }
      },
    );
  }
  unmarkfavourite(product_id: any){
    const user_id = this.userID;
    this.apiservice.remove_to_favourties(user_id,product_id).subscribe((response: any) => {  
      if(response){
        console.log('Unremove Favorite API Response-',response)
      }
      },
    );
  }

  getAllweeklyDeals(){
    const userID = this.userID;
    this.apiservice.get_all_weekly_deals(userID).subscribe((response)=>{
      if(response){
        this.allweeklydeals = response.data;
        console.log('Deals of the Week',this.allweeklydeals );
        // this.isLoading = false;
      }
      
    })
  }
  navigateToinerAllDeals(category_id: any, dealsProduct: any){
    this.router.navigate(['/inner-product-page'], { queryParams: { id: category_id, type: dealsProduct } });
  }
}
