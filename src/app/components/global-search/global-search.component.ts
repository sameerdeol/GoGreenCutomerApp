import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, NgZone, OnInit, Output, QueryList, ViewChildren, AfterViewInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonSearchbar } from '@ionic/angular/standalone';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { register } from 'swiper/element/bundle';
import { toggleFavoritefeatured } from 'src/app/utils/utils';

// Register Swiper custom elements
register();

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GlobalSearchComponent implements OnInit, AfterViewInit {
  @ViewChildren('vendorSwiper') storeSwiperRefs!: QueryList<ElementRef>;
  @ViewChildren('vendorSwiper2') recommendedSwiperRefs!: QueryList<ElementRef>;
  @Output() searchFocus = new EventEmitter<boolean>();
  @Input() vendor_id!: string | number; 

  currency = environment.currencySymbol;
  intervalId: any;
  placeholderHidden: boolean = false;
  searchKeyword: string = '';


  showSearchResults: boolean = false;
  showDesiredData: boolean = false;
  Allvendors: any;
  noVendorsFound: boolean = false;
  searchedProduct: any[]=[];
  baseUrl = environment.baseurl;

  hoveredVendorIndex: number | null = null;
  currentVendorImageIndexes: { [key: number]: number } = {};
  vendorImageIntervals: { [key: number]: any } = {};
  touchTimeouts: { [key: number]: any } = {};
  userID: any;
  backIcon: boolean = false;
  
  private readonly VENDOR_IMAGE_DURATION = 2500; // 2.5 seconds per image

  constructor(private apiservice: ApiserviceService,
    private storage: Storage,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
     this.init();
   }

  async ngOnInit() {
    this.userID = await this.storage.get('userID');
  }

  onSearchChange(event: any) {
    const value = event.detail.value; 
    this.searchKeyword = value;
    this.showSearchResults = !!value.trim(); // show results only when there's some input
    
 
    if (this.searchKeyword.trim()) {
      this.noVendorsFound = false;
      if(this.vendor_id){
         this.getSearchedProductOfVendor(value, this.vendor_id);
      }else{
          this.getSearchedProduct(value);
      }      
      this.searchFocus.emit(true); 
    } else {
      this.searchedProduct = [];  
      this.showDesiredData = false;
      this.showSearchResults = false;
      this.searchFocus.emit(false); 
      
    }
  }

  async init() {
    await this.storage.create();
  }

  ngAfterViewInit() {
    
  }

  navigateToVendorStore(item: any) {
      this.router.navigate(['/store-products'], {
      state: { vendor: item }
    });
  }
  clearSearch() {
    this.backIcon = false;
    this.searchKeyword = '';
    this.showDesiredData = false;
    this.onSearchChange(''); // Trigger your existing logic to reset
    this.placeholderHidden = false; // Show fake placeholder again 
    this.noVendorsFound = false;
  }

  async getVednorByVendorId(vendor_id: any) {
    const user_id = await this.storage.get('userID');
    return this.apiservice.get_all_vendor_by_VendorId(user_id, vendor_id);
  }
  
  async getAllVendorsBySearchedResult(search_name: any) {
    this.showSearchResults = false;   // Hide search dropdown
    const user_id = await this.storage.get('userID');

    this.apiservice.get_all_vendor_on_searchResult(user_id, search_name).subscribe({
      next: (response) => {
        if (response.success === true) {
          console.log("get Vendor by Searched Result", response);
          this.Allvendors = response.data;
               
          this.showDesiredData = true;
          this.showSearchResults = false;
          this.noVendorsFound = false; // Vendors found
          this.searchFocus.emit(true);    
    
        } else {
          this.Allvendors = [];
          this.noVendorsFound = true; // No vendors found
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.Allvendors = [];
        this.noVendorsFound = true; // Show "no vendors" message/image
      }
    });
  }

  async navigateToVendorSearchedVendors(item: any) {
    if (item.type === 'vendor') {
      (await this.getVednorByVendorId(item.id)).subscribe((response) => {
        if (response.success === true) {

          // ✅ Pass the API's vendor data into navigation
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

  async getSearchedProduct(value: any) {
    const searchstring = value;
    const user_id = await this.storage.get('userID');
    this.apiservice.get_all_search_product(searchstring, user_id).subscribe((response: any) => {
      if (response && response.data) {
        const keyword = searchstring.toLowerCase();

        const products = response.data.product?.map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: 'N/A',
          image: item.image,
          type: 'product',
          extras: item.extra
        })) || [];

        const vendorByName = response.data.vendor_by_name?.map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: '',
          image: item.image,
          type: 'vendor',
          extras: item.extra
        })) || [];

        const vendorByProduct = response.data.vendor_by_product?.filter((item: { name: any; }) => !!item.name).map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: '',
          image: item.image,
          type: 'vendor_by_product',
          extras: item.extra
        })) || [];

        const categories = response.data.category?.map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: '',
          image: item.image,
          type: 'category',
          extras: item.extra
        })) || [];

        const subcategories = response.data.subcategory?.map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: '',
          image: item.image,
          type: 'subcategory'
        })) || [];

        // Combine all results
        const allResults = [
          ...categories,
          ...products,
          ...vendorByName,
          ...vendorByProduct,
          ...subcategories
        ];

        // Sort logic
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

        console.log(this.searchedProduct);
      }
    });
  }
  async getSearchedProductOfVendor(searchstring: any, vendor_id: any){
   
     this.apiservice.get_all_product_by_vendor(searchstring, vendor_id).subscribe((response)=>{
      if(response.success == true){  
          const products = response.data.product?.map((item: any) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          price: 'N/A',
          image: item.image,
          type: 'product',
          extras: item.extra
        })) || [];
        this.searchedProduct = products ;
        console.log('searched product of particular Vendor:',response.data.product)
      }
     })
  }
  onBackClick(){
    this.searchFocus.emit(false); 
    this.backIcon = false;
    this.cdr.detectChanges();
    this.noVendorsFound = false;
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

  // onVendorHover(vendorIndex: number, isHovering: boolean) {
  //   const vendor = this.Allvendors[vendorIndex];
    
  //   if (isHovering) {
  //     this.hoveredVendorIndex = vendorIndex;
  //     this.startVendorImageRotation(vendorIndex, vendor);
  //   } else {
  //     this.hoveredVendorIndex = null;
  //     this.stopVendorImageRotation(vendorIndex);
  //   }
  // }

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
  toggleFav(vendor: any) {
      toggleFavoritefeatured(vendor, this.userID, this.apiservice);
  }
   
}
