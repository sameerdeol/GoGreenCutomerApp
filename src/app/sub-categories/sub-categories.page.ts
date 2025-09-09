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
  selector: 'app-sub-categories',
  templateUrl: './sub-categories.page.html',
  styleUrls: ['./sub-categories.page.scss'],
   standalone: true,
    imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SubCategoriesPage implements OnInit {

  bannerImg: any;
  selectedIndex: number = -1;
  categories: any;
  categoryId: any;
  subcategories: any;
  categoryName: any;
  baseUrl = environment.baseurl;
  showSearchResults: boolean = false;
  searchKeyword: string = '';
  searchedProduct: any[] = [];
  bestSeller: any[] = [];
  userID: any;

  cartItems: any[] = [];
  isAddedMap: { [key: string]: boolean } = {}; // key = sliderName_productId
  isSlidingOut = false;
  showCartPopup: boolean = false;

  totalQuantity: number = 0;
  totalAmount: number = 0;
  constructor(private apiservice: ApiserviceService,private route: ActivatedRoute, private router: Router,private location: Location,private storage: Storage) { 
    this.init();
  }
  
  async ngOnInit() {
    this.userID = await this.storage.get('userID');
    this.getAllBannerImg();
    this.getAllCategories();
    this.getBestSellerProducts();
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['id'];
      this.categoryName = params['category_name']; // Retrieve the ID from query params
      console.log("Category categoryName:", this.categoryName);
    });
    this.getAllsubCategories();
   
  }
  async ionViewWillEnter() {
    await this.loadCartFromStorage(); 
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];
  
    this.totalQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Show popup if there are items in the cart
    this.showCartPopup = this.totalQuantity > 0;
   
  }
  async init() {
    await this.storage.create();
  }
  onSearchChange(value: string) {
    this.searchKeyword = value;
    this.showSearchResults = !!value.trim(); // show results only when there's some input
  
    if (this.searchKeyword.trim()) {
      this.getSearchedProduct(value);
    } else {
      this.searchedProduct = [];  
      this.showSearchResults = false;
    }
  }
  getSearchedProduct(value: any){
    const searchstring = value;
    // const searchNum = 2;
    this.apiservice.get_all_search_product(searchstring,this.userID).subscribe((response: any) => {  
      if(response){
        this.searchedProduct = response.data;
        // this.isLoading = false;
        console.log('searchedProduct-',this.searchedProduct)
      }
     },);
  }

  getAllBannerImg(){
    this.apiservice.get_all_banner_imges().subscribe((response)=>{
       this.bannerImg = response.banners;
    })
  }

  selectCategory(index: number, category_id: any, category_name: any): void {
    this.selectedIndex = index;
    this.categoryId = category_id;
    console.log('sow',this.categoryId);
    this.getAllsubCategories();
  }
  selectCategory2(index: number): void {
    this.selectedIndex = index;
  }
  navigateToAllCat(){
    this.router.navigate(['/all-categories']);
}

  getAllCategories() {
    const is_web = false;
    this.apiservice.get_all_categories(is_web).subscribe((response: any) => {  
      if (response) {
        this.categories = response.categories;
  
        // Now that categories are loaded, find the selected index
        const foundIndex = this.categories.findIndex(
          (cat: { id: any }) => cat.id == this.categoryId
        );
  
        if (foundIndex !== -1) {
          this.selectedIndex = foundIndex;
          this.getAllsubCategories(); // Only call this once category ID is valid
        }
      }
    });
  }
  async getBestSellerProducts(){
    const user_id = await this.storage.get('userID');
    this.apiservice.get_best_seller_products(user_id).subscribe((response)=>{
      if(response){
        this.bestSeller = response.product;
        console.log('best seller',response);
      }
    })
  }
  
  navigateToAllProducts2(category_id: any, category_name: any,type: any,heading: any){
    console.log('type in home page', type)
    this.router.navigate(['/inner-product-page'], { queryParams: { id: category_id, type: type, category_name: category_name,heading: heading } });
  }
  toggleFavoritefeatured(features_product: any, product_id: any, is_favourite: any): void {
    features_product.is_favourite = features_product.is_favourite === 1 ? 0 : 1;
    if (features_product.is_favourite === 1) {
      this.markfavourite(product_id);
    } else {
      this.unmarkfavourite(product_id);
    }
  }
  markfavourite(product_id: any){
    const user_id = this.userID;
    // this.apiservice.add_to_favourties(user_id,product_id).subscribe((response: any) => {  
    //   if(response){
    //     // console.log('Favorite API Response-',response)
    //   }
    //   },
    // );
  }
  unmarkfavourite(product_id: any){
    const user_id = this.userID;
    // this.apiservice.remove_to_favourties(user_id,product_id).subscribe((response: any) => {  
    //   if(response){
    //     // console.log('Unremove Favorite API Response-',response)
    //   }
    //   },
    // );
  }
  async navigateToproduct(id: any){
    await this.storage.set('product_id', id);
    this.router.navigate(['/product-detail']);
  }

  async addToCart(product: any) {
    const existingItem = this.cartItems.find(item => item.id === product.id);
    //  console.log('product title',product.title)
    //  console.log('product subtitle',product.subtitle)
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
  getQuantity(productId: number): number {
    const item = this.cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
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
    if (this.cartItems.length === 0) {
      this.showCartPopup = false;
    }
    // console.log('🛒 Cart loaded from storage:', this.cartItems);
  }


  showPopup() {
    this.showCartPopup = true;
  }
  getAllsubCategories(){
    const catID = this.categoryId;
    console.log('check on change ',catID)
    this.apiservice.get_all_subcat_by_catID(catID).subscribe((response: any) => {  
      if(response.success == true){
        this.subcategories = response.subcategories;
        console.log('res==',response)
      }else if(response.success == false){
        this.subcategories = [];
        console.log('check on change  subcategories',this.subcategories)
        console.log('res false==',response)
      }
      

      },
    );
  }
  navigateToinerAllProducts(category_id: any,category_name: any){
    console.log(category_name);
    const type = 'subCatID'
    this.router.navigate(['/inner-product-page'], { queryParams: { id: category_id, category_name:category_name,type:type } });
  }
  goback(){
    this.location.back();
  }
  navigateToViewCart(){
    this.router.navigate(['/view-cart']);
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
