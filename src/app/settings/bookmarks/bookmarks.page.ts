import { CommonModule, Location } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonHeaderComponent } from '../../components/common-header/common-header.component';
import { register } from 'swiper/element/bundle';
import { ApiserviceService } from '../../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Router, RouterModule } from '@angular/router';
import { FooterTabsComponent } from '../../components/footer-tabs/footer-tabs.component';
import { Storage } from '@ionic/storage-angular';
import { ChangeDetectorRef } from '@angular/core';
import { SwiperOptions } from 'swiper/types';
import { toggleFavourite } from '../../utils/utils';

register();


@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.page.html',
  styleUrls: ['./bookmarks.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, CommonHeaderComponent,RouterModule ], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BookmarksPage implements OnInit {

    baseUrl = environment.baseurl;
    userID: any;
    hoveredVendorIndex: number | null = null;
    currentVendorImageIndexes: { [key: number]: number } = {};
    vendorImageIntervals: { [key: number]: any } = {};
    touchTimeouts: { [key: number]: any } = {};
  
    Allvendors: any[] = [];
    isLoading: boolean = true;
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
  
  constructor(private apiservice:ApiserviceService,
     private router: Router,
     private storage: Storage,
    private location: Location) {
    this.init();
   }

  async ngOnInit() {
    // const token = await Storage.get({ key: 'userID' });
    this.userID =  await this.storage.get('userID');
    this.getAllVendors([null]);
    console.log('Wishlist PAge User ID:', this.userID );

  }
  async init() {
    await this.storage.create();
  }


  getAllVendors(vendor_type_id: (number | null)[]) {
    const user_id = this.userID;
    this.Allvendors = [];
    this.isLoading = true;
    this.apiservice.get_all_vendors(user_id, vendor_type_id).subscribe({
      next: (response) => {
        if (response.success === true) {
          // Filter only bookmarked vendors (is_favourite = 1)
          this.Allvendors = response.data.filter((vendor: any) => vendor.is_favourite === 1);
          this.isLoading = false;
          // console.log('show bookmarked vendors', this.Allvendors);
        } else {
          this.Allvendors = [];
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.Allvendors = [];
        this.isLoading = false;
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
      console.log('Before toggle - Allvendors count:', this.Allvendors.length);
      console.log('Vendor to remove:', vendor.vendor_id, vendor.store_name);
      
      // Create a copy of the vendor to avoid modifying the original object
      const vendorCopy = { ...vendor };
      
      // Call the API to toggle favorite status
      toggleFavourite(vendorCopy, this.userID, this.apiservice, 'vendor');
      
      // Remove the vendor from the list immediately (since this is bookmarks page)
      // and we only show bookmarked vendors, so any toggle means remove
      // Use vendor_id as the unique identifier
      this.Allvendors = this.Allvendors.filter(v => v.vendor_id !== vendor.vendor_id);
      
      console.log('After toggle - Allvendors count:', this.Allvendors.length);
      console.log('Remaining vendors:', this.Allvendors.map(v => v.store_name));
    }

}
