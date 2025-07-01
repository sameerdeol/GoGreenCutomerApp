import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BottomSlideComponent } from '../components/bottom-slide/bottom-slide.component';
// import { Storage } from '@capacitor/storage';
import { Storage } from '@ionic/storage-angular';
register();
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HeaderComponent, CommonModule, FooterTabsComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
  // Import IonicModule here
})

 // ✅ Properly typed object
export class HomePage implements OnInit {
  categoryImagesLoaded: any[]=[];
  bannerImagesLoaded: any[]=[];
  featuredImagesLoaded: any[]=[];
  dealImagesLoaded: any[]=[];
  brandImagesLoaded: any[]=[];
  beautyImagesLoaded: any[]=[];
  categoryOneImagesLoaded: any[]=[];
  categoryTwoImagesLoaded:any[]=[];

  constructor(private apiservice: ApiserviceService, private router: Router,private modalCtrl: ModalController,private storage: Storage) {
    this.init();
   }

  quantity: number = 1; // Initial quantity
  isLoading = true;
  categories: any;
  category_img: any;
  bannerImg: any;
 
  allbrands: any;
  allsubCategories: any;
  allfeaturesproducts: any;
  allweeklydeals: any;
  categoryOneData: any;
  beautySubCat: any[]=[];
  categoryTwoData: any;
  baseUrl = environment.baseurl;
  isFavorite: boolean = false;
  isAdded: boolean[] = []; // Array to track which items are added
  quantities: number[] = [];
  cat4: any; // Array to store quantities
  userID: any;

  images: any[] = [];
  name: any[] = [];

  showCartPopup: boolean = false;

  totalQuantity: number = 0;
  totalAmount: number = 0;
  searchedProduct: any[]=[];

  cartItems: any[] = [];
  searchKeyword: string = '';
  isAddedMap: { [key: string]: boolean } = {}; // key = sliderName_productId
  isSlidingOut = false;
  Allvendors: any;


  showSearchResults: boolean = false;

  async init() {
    await this.storage.create();
  }
  async ionViewWillEnter() {
    await this.loadCartFromStorage(); 
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];
  
    this.totalQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Show popup if there are items in the cart
    this.showCartPopup = this.totalQuantity > 0;
   
  }
 
  async ngOnInit() {
    await this.loadCartFromStorage();
    const user_id = await this.storage.get('userID');
    const token = await this.storage.get('auth_token');
  
    this.userID =  user_id;
    this.storage.get('statictoken')
    // console.log('statictoken:', this.storage.get('statictoken'));
    // console.log('Token ID:', token);

    this.getAllCategories();
    this.getAllBannerImg();
    this.getAllbrands();
    this.getAllSubBrands();
    this.getAllFeaturesProducts();
    this.getAllweeklyDeals();
    this.dynamicCategory();
    this.dynamicCategory2();
    this.dynamicCategory3();
    this.dynamicCategory4();
    this.getAllVendors();
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

  selectedIndex: number = -1;

  showPopup() {
    this.showCartPopup = true;
  }
  selectCategory2(index: number): void {
    this.selectedIndex = index;
   
  }
  selectCategory(index: number, category_id: any, category_name: any): void {
    this.selectedIndex = index;
    this.router.navigate(['/sub-categories'], { queryParams: { id: category_id, category_name: category_name } });
  }
  navigateToAllProducts2(category_id: any, category_name: any,type: any,heading: any){
    console.log('type in home page', type)
    this.router.navigate(['/inner-product-page'], { queryParams: { id: category_id, type: type, category_name: category_name,heading: heading } });
  }

  navigateToSubCAtProducts(subCatId: any, category_name: any, type: any){
    this.router.navigate(['/inner-product-page'], { queryParams: { id: subCatId, type: type ,category_name:category_name} });
  }

  navigateToSubCAtPage(category_id: any ,category_name: any){
    this.router.navigate(['/sub-categories'], { queryParams: { id: category_id , category_name: category_name} });
  }
  navigateToAllProducts(category_id: any, category_name: any,type: any){
    console.log('type in home page', type)
    this.router.navigate(['/inner-product-page'], { queryParams: { id: category_id, type: type, category_name: category_name } });
  }

  navigateToAllCat(){
      this.router.navigate(['/all-categories']);
  }

  toggleFavoritefeatured(vendor: any): void {
    vendor.is_favourite = vendor.is_favourite === 1 ? 0 : 1;
  
    if (vendor.is_favourite === 1) {
      this.markfavourite(vendor.vendor_id);
    } else {
      this.unmarkfavourite(vendor.vendor_id);
    }
  }
 
  markfavourite(vendor_id: any){
    const user_id = this.userID;
    const favnum = 1;
    this.apiservice.addToFavouriteVendors(user_id,vendor_id,favnum).subscribe((response: any) => {  
      if(response){
        console.log('Favorite API Response-',response)
      }
      },
    );
  }
  unmarkfavourite(vendor_id: any){
    const user_id = this.userID;
    const favnum = 1;
    this.apiservice.removeToFavouriteVEndors(user_id,vendor_id,favnum).subscribe((response: any) => {  
      if(response){
        console.log('Unremove Favorite API Response-',response)
      }
      },
    );
  }
  navigateToBrands(brandID: Number){
    // console.log('brandID--',brandID)
    this.router.navigate(['/inner-product-page'], { queryParams: { id: brandID, type: 'brandProducts' } });
  }
  async refreshPage(event: any) {
    await this.loadCartFromStorage();
  
    const user_id = await this.storage.get('userID');
    const token = await this.storage.get('auth_token');
    this.userID = user_id;
  
    this.getAllCategories();
    this.getAllBannerImg();
    this.getAllbrands();
    this.getAllSubBrands();
    this.getAllFeaturesProducts();
    this.getAllweeklyDeals();
    this.dynamicCategory();
    this.dynamicCategory2();
    this.dynamicCategory3();
    this.dynamicCategory4();
  
    // ✅ Complete the refresher once all done
    event.target.complete();
  }
  navigateToViewCart(){
    this.router.navigate(['/view-cart']);
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
  navigateTosearchedResult(product: any) {
    const title = product.title;
    const type = product.type;
  
    this.router.navigate(['/searched-result'], {
      queryParams: {
        title: title,
        type: type
      }
    });
  }
  async removeCartStorage() {
    this.isSlidingOut = true;
  
    // Wait for animation to finish (e.g. 400ms)
    setTimeout(async () => {
      await this.storage.remove('cartItems');
      
      // this.activeCart = [];
      // this.totalQuantity = 0;
      // this.totalAmount = 0;
      this.cartItems.forEach(item => {
        // Set isAddedMap to true for each item
        this.isAddedMap[item.id] = false;
      });
      this.cartItems = [];
      this.showCartPopup = false;
      this.isSlidingOut = false;
    }, 400);
  }
  getSearchedProduct(value: any) {
    const searchstring = value;
  
    this.apiservice.get_all_search_product(searchstring, this.userID).subscribe((response: any) => {
      if (response && response.data) {
        const keyword = searchstring.toLowerCase(); // <-- moved here
  
        const products = response.data.product?.map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: 'N/A',
          image: item.image,
          type: 'product'
        })) || [];
  
        const vendors = response.data.vendor_by_name?.map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: '',
          image: item.image,
          type: 'vendor'
        })) || [];
  
        const categories = response.data.category?.map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: '',
          image: item.image,
          type: 'category'
        })) || [];
  
        const subcategories = response.data.subcategory?.map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: '',
          image: item.image,
          type: 'subcategory'
        })) || [];
  
        const allResults = [...categories, ...products, ...vendors, ...subcategories];
  
        this.searchedProduct = allResults.sort((a, b) => {
          const aMatch = a.title.toLowerCase().includes(keyword) ? 1 : 0;
          const bMatch = b.title.toLowerCase().includes(keyword) ? 1 : 0;
  
          if (aMatch === bMatch) {
            if (a.type === 'category' && b.type !== 'category') return -1;
            if (b.type === 'category' && a.type !== 'category') return 1;
            return 0;
          }
  
          return bMatch - aMatch;
        });
  
        this.isLoading = false;
        console.log('Sorted searchedProduct:', this.searchedProduct);
      }
    });
  }
  
  
    
  getAllCategories(){
    const is_web = false;
    this.apiservice.get_all_categories(is_web).subscribe((response: any) => {  
      if(response){
        this.categories = response.categories;
        this.isLoading = false;
        // console.log('cat-',this.categories)
      }

      },
    );
  }
  
  getAllBannerImg(){
    this.apiservice.get_all_banner_imges().subscribe((response: any)=>{
      if(response){
        this.bannerImg = response.banners;
        this.isLoading = false;
      }
      
    })
  }
  navigateToAllBrands(){
    this.router.navigate(['/inner-product-page'], { queryParams: { type: 'AllbrandProducts' } });
  }
  getAllbrands(){
    this.apiservice.get_all_brands().subscribe((response)=>{
      if(response){
        const heading = "Popular Brands"
        this.allbrands = response.productBrands;
        this.allbrands.forEach((deal: { heading: any; }) => {
          deal.heading = heading; // Add the heading to each item
        });
        this.isLoading = false;
        console.log('brands-',this.allbrands)
      }

    })
  }

  getAllSubBrands(){
    const is_web= false;
    this.apiservice.get_all_sub_categories(is_web).subscribe((response)=>{
      if(response){
        this.allsubCategories = response.subcategories;
        this.isLoading = false;
        // console.log('alll sub categories',this.allsubCategories)
      }
      
    })
  }

  getAllFeaturesProducts(){
    const userID = this.userID;
    this.apiservice.get_all_features_product(userID).subscribe((response)=>{
      if(response){
        const heading = 'Featured Products';
        this.allfeaturesproducts = response.data;
        this.allfeaturesproducts.forEach((featured: { heading: any; }) => {
          featured.heading = heading; // Add the heading to each item
        });
        // console.log('featured', this.allfeaturesproducts)
        this.isLoading = false;
      }
      
    })
  }
  getAllweeklyDeals(){
    const userID = this.userID;
    this.apiservice.get_all_weekly_deals(userID).subscribe((response)=>{
      if(response){
        const heading = 'Deals of the Week';
        this.allweeklydeals = response.data;
        this.allweeklydeals.forEach((deal: { heading: any; }) => {
          deal.heading = heading; // Add the heading to each item
        });
        console.log('Deals of the Week',this.allweeklydeals );
        this.isLoading = false;
       
      }
      
    })
  }
  async navigateToproduct(id: any){
    await this.storage.set('product_id', id);
    this.router.navigate(['/product-detail']);
  }

  dynamicCategory(){
    const index = 1
    const categoryset = 1
    this.apiservice.get_dynamic_category(index,categoryset).subscribe((response)=>{
      if(response){
        this.categoryOneData = response.categories;
        this.isLoading = false;
        console.log('dynamic response 1',response)
      }
    
    })
  }
  dynamicCategory2(){
    const index = 2;
    const categoryset = 0;
    this.apiservice.get_dynamic_category(index,categoryset).subscribe((response)=>{
      if(response){
        this.categoryTwoData = response.products;
        this.isLoading = false;
        // console.log('dynamic response 2',response)
      }
    
    })
  }
  dynamicCategory3(){
    const index = 3;
    const categoryset = 1;
    this.apiservice.get_dynamic_category(index,categoryset).subscribe((response)=>{
      if(response){
        this.beautySubCat = response.categories;
        this.isLoading = false;
        // console.log('dynamic response 3',response)
      }
    
    })
  }
  dynamicCategory4(){
    const index = 4;
    const categoryset = 0;
    this.apiservice.get_dynamic_category(index,categoryset).subscribe((response)=>{
      if(response){
        this.cat4 = response.products.map((product: { is_favourite: any; }) => ({
          ...product,
          isFavorite: product.is_favourite === 1
        }));
        this.isLoading = false;
        console.log('dynamic response 4',response)
      }
    
    })
  }
  getSlideIndexes(length: number) {
    return Array.from({ length: Math.ceil(length / 2) }, (_, i) => i * 2);
  }
  async openSlide() {
    const modal = await this.modalCtrl.create({
      component: BottomSlideComponent,
      breakpoints: [0, 0.4, 0.7],
      initialBreakpoint: 0.4,
      cssClass: 'bottom-slide-modal'
    });
  
    await modal.present();
  }
  getAllVendors(){
    const user_id = this.userID;
    this.apiservice.get_all_vendors(user_id).subscribe((response)=>{
      if(response){
         this.Allvendors = response.data;
         console.log('show all vendors',this.Allvendors)
      }
    })
  }
  navigateToVendorStore(item: any) {
    this.router.navigate(['/store-products'], {
      queryParams: {
        id: item.vendor_id,
        name: item.store_name,
        profile_pic: item.profile_pic,
        rating: item.rating,
        is_favourite: item.is_favourite
      }
    });
  }
}
