import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule,Location  } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
register();
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  providers: [Storage],
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductDetailPage implements OnInit {

  constructor(private route: ActivatedRoute,private apiservice: ApiserviceService,private location: Location,private storage: Storage,private router: Router) {
    this.init();
   }
  property_detail: any;
  productId: any;
  allweeklydeals: any;
  category_id: Number = 21;
  category_realted_brands: any;
  baseUrl = environment.baseurl;
  userID: any;
  itemCount: number = 0;
  addToCartVisible: boolean = true;

  cartState: CartState = {};
  isAdded: any; 
  price: number = 0;
  quantity: number = 0;
  totalQuantity: number = 0;
  totalAmount: number = 0;
  showCartPopup: boolean = false;
  showAddTOCart: boolean = false;

  // totalQuantity: number = 0;
  // totalAmount: number = 0;
  relatedBrandInfo:any;
  cartItems: any[] = [];
  isAddedMap: { [key: string]: boolean } = {}; 

  rating = 5;
  stars = [1, 2, 3, 4, 5];

  // quantity : number = 0;
  async init() {
    await this.storage.create();
  }
  async ionViewWillEnter() {
    await this.loadCartFromStorage(); // Re-load on every visit to this page
  }
  async ngOnInit() {
    const user_id = await this.storage.get('userID');
    this.userID =  user_id;
    // if (this.userID) {
    //   this.cartState = await this.storage.get(`cart_${this.userID}`) || {};
  
    // }
    // console.log('token in AppComponent:', token.value);
    // = this.route.snapshot.paramMap.get('id');
    // const product_id = await this.storage.get('product_id');
    // this.productId = product_id;
    // console.log('product_id:', product_id);
    this.initializeCartState(); 
    this.getproductDetail();
    this.getAllweeklyDeals();
    this.getAllCategoryRealtedBrnads();
  }

  goBack() {
    this.location.back();
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
    console.log('clickerd')
    await this.storage.set('product_id', id);
    this.getproductDetail();
    // this.router.navigate(['/product-detail']);
  }

  markfavourite(product_id: any){
    const user_id = this.userID;
    this.apiservice.add_to_favourties(user_id,product_id).subscribe((response: any) => {  
      if(response){
        console.log('Favorite API Response-',response)
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
  navigateToinerAllDeals(category_id: any, dealsProduct: any){
    this.router.navigate(['/inner-product-page'], { queryParams: { id: category_id, type: dealsProduct } });
  }
  setRating(value: number) {
    this.rating = value;
    console.log('⭐ Selected rating:', this.rating);
  }
  initializeCartState() {
    const sliderNames = ["categoryTwoData", "allweeklydeals", "product", "allfeaturesproducts"];
  
    sliderNames.forEach((slider) => {
      this.cartState[slider] = {
        isAdded: [],
        quantities: [],
        prices: [], // ✅ Ensure prices array is always initialized
        images: [],
        name: [],
        description: [],
        category_id: [],
        id: []
      };
    });
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
        image: product.featured_image
      });
    }
    // this.showPopup();
    this.updateTotalQuantity();
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
    this.updateTotalQuantity();

  }
  getQuantity(productId: number): number {
    const item = this.cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  }
  getTotalPrice(product: any): number {
    const quantity = this.getQuantity(product.id);
    return quantity * product.price;
  }
  updateTotalQuantity() {
    this.totalQuantity = this.cartItems.reduce((total, item) => total + item.quantity, 0);
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
  
    console.log('🛒 Cart loaded from storage:', this.cartItems);
  }
  navigateToBrands(brandID: Number){
    // console.log('brandID--',brandID)
    this.router.navigate(['/inner-product-page'], { queryParams: { id: brandID, type: 'brandProducts' } });
  }
  
 getBrandImgAndNAme(brandId: any){
  this.apiservice.get_brand_by_brand_id(brandId).subscribe((response)=>{
    this.relatedBrandInfo = response.productBrand;
    console.log('brand',this.relatedBrandInfo);
 })
 }
  async getproductDetail(){
    const id = await this.storage.get('product_id');
    console.log('product_id:', id);
    this.apiservice.get_product_details(id).subscribe((response)=>{
       this.property_detail = response.product;
       console.log('res',this.property_detail);
       const brandId =  response.product.brand_id;
       this.getBrandImgAndNAme(brandId);
      
    })
  }
  getAllweeklyDeals(){
    const userID = this.userID;
    this.apiservice.get_all_weekly_deals(userID).subscribe((response)=>{
      this.allweeklydeals = response.data;
      
    })
  }
  getAllCategoryRealtedBrnads(){
    this.apiservice.get_category_realted_brnads(this.category_id).subscribe((response: any)=>{
      this.category_realted_brands = response.productBrands;
      console.log(this.category_realted_brands)
    })
  }
  ngAfterViewInit() {
    document.querySelectorAll('ion-accordion').forEach((accordion) => {
      (accordion as HTMLElement).style.setProperty('--color', 'black');
    });
  }



}
interface CartState {
  [key: string]: CartItem;
}
interface CartItem {
  isAdded: boolean[];
  quantities: number[];
  prices: number[];  // ✅ Ensure TypeScript recognizes `prices`
  images: any[];
  name: any[];
  description: any[];
  category_id: any[];
  id: any[];
}