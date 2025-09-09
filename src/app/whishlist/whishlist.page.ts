import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
// import { HeaderComponent } from '../components/header/header.component';
import { CommonModule ,Location } from '@angular/common';
import { register } from 'swiper/element/bundle';
// import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { Storage } from '@ionic/storage-angular';
import { ChangeDetectorRef } from '@angular/core';
import { SwiperOptions } from 'swiper/types';
import { toggleFavourite } from '../utils/utils';
register();


@Component({
  selector: 'app-whishlist',
  templateUrl: './whishlist.page.html',
  styleUrls: ['./whishlist.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WhishlistPage implements OnInit {

  constructor(private apiservice:ApiserviceService, private router: Router,private storage: Storage,private cdr: ChangeDetectorRef,private location: Location) {
    this.init();
   }

  allweeklydeals: any;
  allbrands: any;
  baseUrl = environment.baseurl;
  userID: any;

  isAddedMap: { [key: string]: boolean } = {};
  activeCart: any[] = [];
  cartItems: any[] = [];
  selectedItemMap: { [key: number]: boolean } = {};
  totalQuantity: number = 0;
  totalAmount: number = 0;
  allfavoriteProducts: any;

  selectAll: boolean = false;
  selectedItems: any[] = [];

  activeCategory: string | null = 'Discount';
  isFilterVisible: boolean = false;
  activeDropdown: string | null = null; 
  selectedBrandIds: number[] = [];
  selectedDiscountThresholds: number[] = [];
  selectedPriceRanges: { min: number, max: number }[] = [];
  Allcategories: any;
  selectedCategoryIds: number[] = [];
  selectedDeliveryTypes: number[] = []; 

  hoveredVendorIndex: number | null = null;
  currentVendorImageIndexes: { [key: number]: number } = {};
  vendorImageIntervals: { [key: number]: any } = {};
  touchTimeouts: { [key: number]: any } = {};

  Allvendors: any[] = [];
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




  async ngOnInit() {
    // const token = await Storage.get({ key: 'userID' });
    this.userID =  await this.storage.get('userID');
    this.getAllVendors([null]);
    console.log('Wishlist PAge User ID:', this.userID );

  }
  async init() {
    await this.storage.create();
  }

  navigateToback(){
    this.location.back();
  }
  getAllVendors(vendor_type_id: (number | null)[]) {
    const user_id = this.userID;
    this.Allvendors = [];
    this.apiservice.get_all_vendors(user_id, vendor_type_id).subscribe({
      next: (response) => {
        if (response.success === true) {
          this.Allvendors = response.data;
          // this.isLoading = false;
          // console.log('show all vendors', this.Allvendors);
        } else {
          this.Allvendors = [];

        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.Allvendors = [];

      }
    });
  }
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

  navigateToVendorStore(item: any) {
     console.log('this is homeID', this.userID)
    this.router.navigate(['/store-products'], {
      state: { vendor: item , user_id: this.userID}
    });
    // console.log('this is ', item.title)
  }
    toggleFav(vendor: any) {
      toggleFavourite(vendor, this.userID, this.apiservice,'vendor');
    }




}
