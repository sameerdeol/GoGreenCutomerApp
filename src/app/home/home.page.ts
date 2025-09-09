import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { CartService } from '../services/cart.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { BottomSlideComponent } from '../components/bottom-slide/bottom-slide.component';
import { Storage } from '@ionic/storage-angular';
import { ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { GlobalSearchComponent } from "../components/global-search/global-search.component";
import type { SwiperOptions } from 'swiper/types';
import { toggleFavourite } from '../utils/utils';

register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HeaderComponent, CommonModule, FooterTabsComponent, GlobalSearchComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class HomePage implements OnInit, OnDestroy {
  @ViewChildren('storeSwiper') storeSwiperRefs!: QueryList<ElementRef>;
  @ViewChildren('recommendedSwiper') recommendedSwiperRefs!: QueryList<ElementRef>;
  private activeSwiper: any = null;

  // Image carousel properties for vendors
  hoveredVendorIndex: number | null = null;
  currentVendorImageIndexes: { [key: number]: number } = {};
  vendorImageIntervals: { [key: number]: any } = {};
  touchTimeouts: { [key: number]: any } = {};
  
  private readonly VENDOR_IMAGE_DURATION = 2500; // 2.5 seconds per image

  outerSliderOpts: SwiperOptions = {
    slidesPerView: 1,
    pagination: { clickable: true }
  };

  innerSliderOpts: SwiperOptions = {
    slidesPerView: 1.2,
    spaceBetween: 10,
    freeMode: true
  };

  // All your existing properties
  currency = environment.currencySymbol;
  categoryImagesLoaded: any[]=[];
  bannerImagesLoaded: any[]=[];
  featuredImagesLoaded: any[]=[];
  dealImagesLoaded: any[]=[];
  brandImagesLoaded: any[]=[];
  beautyImagesLoaded: any[]=[];
  categoryOneImagesLoaded: any[]=[];
  categoryTwoImagesLoaded:any[]=[];
  hideDiv = false;
  quantity: number = 1;
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
  isAdded: boolean[] = [];
  quantities: number[] = [];
  cat4: any;
  userID: any;
  images: any[] = [];
  name: any[] = [];
  showCartPopup: boolean = false;
  totalQuantity: number = 0;
  totalAmount: number = 0;
  searchedProduct: any[]=[];
  cartItems: any[] = [];
  searchKeyword: string = '';
  isAddedMap: { [key: string]: boolean } = {};
  isSlidingOut = false;
  Allvendors: any[] = [];
  selectedCategoryIndex: number = 0;
  showSearchResults: boolean = false;
  currentText = '';
  animationClass = 'animate__fadeInUp';
  suggestions = ['bread', 'milk', 'rice', 'tomatoes', 'eggs', 'fruits', 'vegetables', 'meat', 'dairy', 'snacks'];
  index = 0;
  intervalId: any;
  animationKey = 0;
  placeholderHidden: boolean = false;
  noVendorsFound = false;
  outerCategoryVisible = true;
  selectedIndex: number = -1;
  hoveredIndex: number | null = null;

  constructor(
    private apiservice: ApiserviceService, 
    private router: Router,
    private modalCtrl: ModalController,
    private storage: Storage, 
    private cartService: CartService
  ) {
    this.init();
  }

  // Image carousel methods for vendors
  getVendorImages(vendor: any): string[] {
    return vendor?.featured_images?.length > 0 
      ? vendor.featured_images 
      : [vendor.default_image || '/assets/placeholder-vendor.jpg'];
  }

  getCurrentVendorImageIndex(vendorIndex: number): number {
    return this.currentVendorImageIndexes[vendorIndex] || 0;
  }

  getVendorImageOpacity(vendorIndex: number, imageIndex: number): number {
    const currentIndex = this.getCurrentVendorImageIndex(vendorIndex);
    const isHovered = this.hoveredVendorIndex === vendorIndex;
    
    if (!isHovered) return imageIndex === 0 ? 1 : 0;
    return imageIndex === currentIndex ? 1 : 0;
  }

  getVendorImageTransform(vendorIndex: number, imageIndex: number): string {
    const currentIndex = this.getCurrentVendorImageIndex(vendorIndex);
    const isHovered = this.hoveredVendorIndex === vendorIndex;
    
    if (!isHovered) return 'scale(1)';
    
    if (imageIndex === currentIndex) {
      return 'scale(1.02)'; // Slight zoom on active image
    }
    return 'scale(1)';
  }

  onVendorHover(vendorIndex: number, isHovering: boolean) {
    const vendor = this.Allvendors[vendorIndex];
    
    if (isHovering) {
      this.hoveredVendorIndex = vendorIndex;
      this.startVendorImageRotation(vendorIndex, vendor);
    } else {
      this.hoveredVendorIndex = null;
      this.stopVendorImageRotation(vendorIndex);
    }
  }

  onVendorTouch(vendorIndex: number) {
    const vendor = this.Allvendors[vendorIndex];
    this.hoveredVendorIndex = vendorIndex;
    this.startVendorImageRotation(vendorIndex, vendor);
    
    // Clear any existing timeout for this vendor
    if (this.touchTimeouts[vendorIndex]) {
      clearTimeout(this.touchTimeouts[vendorIndex]);
    }
    
    // Auto-stop after 4 seconds on mobile
    this.touchTimeouts[vendorIndex] = setTimeout(() => {
      if (this.hoveredVendorIndex === vendorIndex) {
        this.hoveredVendorIndex = null;
        this.stopVendorImageRotation(vendorIndex);
      }
    }, 4000);
  }

  startVendorImageRotation(vendorIndex: number, vendor: any) {
    if (!vendor?.featured_images || vendor.featured_images.length <= 1) return;
    
    // Initialize current index
    if (!(vendorIndex in this.currentVendorImageIndexes)) {
      this.currentVendorImageIndexes[vendorIndex] = 0;
    }

    // Clear existing interval
    this.clearVendorImageInterval(vendorIndex);

    // Start image rotation
    this.vendorImageIntervals[vendorIndex] = setInterval(() => {
      const currentIndex = this.currentVendorImageIndexes[vendorIndex];
      this.currentVendorImageIndexes[vendorIndex] = (currentIndex + 1) % vendor.featured_images.length;
    }, this.VENDOR_IMAGE_DURATION);
  }

  stopVendorImageRotation(vendorIndex: number) {
    this.clearVendorImageInterval(vendorIndex);
    this.clearVendorTouchTimeout(vendorIndex);
    // Reset to first image when stopping
    this.currentVendorImageIndexes[vendorIndex] = 0;
  }

  clearVendorImageInterval(vendorIndex: number) {
    if (this.vendorImageIntervals[vendorIndex]) {
      clearInterval(this.vendorImageIntervals[vendorIndex]);
      delete this.vendorImageIntervals[vendorIndex];
    }
  }

  clearVendorTouchTimeout(vendorIndex: number) {
    if (this.touchTimeouts[vendorIndex]) {
      clearTimeout(this.touchTimeouts[vendorIndex]);
      delete this.touchTimeouts[vendorIndex];
    }
  }

  handleVendorClick(index: number, vendor: any) {
    // Start image carousel on click
    this.onVendorTouch(index);
    // Navigate to vendor store
    this.navigateToVendorStore(vendor);
  }


  async init() {
    await this.storage.create();
  }

  async ngOnInit() {
    const user_id = await this.storage.get('userID');
    // const token = await this.storage.get('auth_token');
    this.userID = user_id;
    this.getAllVendors([null]);
    this.storage.get('statictoken')
    this.getAllVendorTypes();
    this.getAllBannerImg();
    this.onCategorySelect(0, 0);
  }
  async ionViewWillEnter() {
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];

    // Update cart service with current cart items
    this.cartService.setCartItems(this.cartItems);
    this.totalQuantity = this.cartService.getCurrentQuantity();
  }
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    // Clean up all vendor image intervals and timeouts
    Object.keys(this.vendorImageIntervals).forEach(key => {
      clearInterval(this.vendorImageIntervals[+key]);
    });
    Object.keys(this.touchTimeouts).forEach(key => {
      clearTimeout(this.touchTimeouts[+key]);
    });
  }
  startRotatingSuggestions() {
    this.currentText = this.suggestions[0];
    this.animationKey = Date.now(); // unique to trigger animation

    this.intervalId = setInterval(() => {
      this.index = (this.index + 1) % this.suggestions.length;
      
      // Add fade out animation
      this.animationClass = 'animate__fadeOutUp';
      
      setTimeout(() => {
        this.currentText = this.suggestions[this.index];
        this.animationKey = Date.now(); 
        
        // Add fade in animation
        this.animationClass = 'animate__fadeInUp';
      }, 300); // wait for fade out to complete
      
    }, 3000); // use 3000ms for smoother feel
  }
  // All your existing methods remain the same...
  onSearchFocusChange(isFocused: boolean) {
    this.hideDiv = isFocused;
    // console.log('onfocus change',this.hideDiv)
  }

  selectCategory2(index: number): void {
    this.selectedIndex = index;
  }

  onCategorySelect(index: number, item: any) {
    this.selectedCategoryIndex = index;
    this.getAllVendors([item.id])
  }

  selectCategory(index: number, category_id: any, category_name: any): void {
    this.selectedIndex = index;
    this.router.navigate(['/sub-categories'], { queryParams: { id: category_id, category_name: category_name } });
  }

  toggleFav(vendor: any) {
    toggleFavourite(vendor, this.userID, this.apiservice,'vendor');
  }
 
  async refreshPage(event: any) {
    const user_id = await this.storage.get('userID');
    this.userID = user_id;
    this.getAllVendors([null]);
    this.getAllVendorTypes();
    this.getAllBannerImg();
    event.target.complete();
  }

  getAllVendorTypes(){
    this.apiservice.get_all_categories2().subscribe((response: any) => {  
      if(response.status == true){
        this.isLoading = false;
        this.categories = response.data;
      }
    });
  }
  
  getAllBannerImg(){
    this.apiservice.get_all_banner_imges().subscribe((response: any)=>{
      if(response){
        this.bannerImg = response.banners;
        this.isLoading = false;
      }
    })
  }

  getAllVendors(vendor_type_id: (number | null)[]) {
    const user_id = this.userID;
    this.Allvendors = [];
    this.apiservice.get_all_vendors(user_id, vendor_type_id).subscribe({
      next: (response) => {
        if (response.success === true) {
          this.Allvendors = response.data;
          this.noVendorsFound = false;
          this.isLoading = false;
          // console.log('show all vendors', this.Allvendors);
        } else {
          this.Allvendors = [];
          this.noVendorsFound = true;
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.Allvendors = [];
        this.noVendorsFound = true;
      }
    });
  }

  getAllVendorsBySearchedResult(search_name: any) {
    this.showSearchResults = false;
    this.outerCategoryVisible = false;
    this.noVendorsFound = false;
    this.isLoading = true;

    const user_id = this.userID;

    this.apiservice.get_all_vendor_on_searchResult(user_id, search_name).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success === true) {
          // console.log("get Vendor by Searched Result", response);
          this.Allvendors = response.data;
          this.noVendorsFound = false;
        } else {
          this.Allvendors = [];
          this.noVendorsFound = true;
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.isLoading = false;
        this.Allvendors = [];
        this.noVendorsFound = true;
      }
    });
  }

  getVednorByVendorId(vendor_id: any) {
    const user_id = this.userID;
    return this.apiservice.get_all_vendor_by_VendorId(user_id, vendor_id);
  }

  navigateToVendorStore(item: any) {
     console.log('this is homeID', this.userID)
    this.router.navigate(['/store-products'], {
      state: { vendor: item , user_id: this.userID}
    });
    // console.log('this is ', item.title)
  }

  navigateToVendorSearchedVendors(item: any) {
    if (item.type === 'vendor') {
      // console.log('Vendor item', item);

      this.getVednorByVendorId(item.id).subscribe((response) => {
        if (response.success === true) {
          console.log('Vendor by VendorID', response);

          this.router.navigate(['/store-products'], {
            state: { vendor: response.data[0] }
          });
        } else {
          console.warn('Vendor not found for id:', item.id);
        }
      });

    } else {
      this.getAllVendorsBySearchedResult(item.title);
    }
  }
}