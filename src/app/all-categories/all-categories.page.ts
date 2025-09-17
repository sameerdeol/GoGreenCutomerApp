import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
// import { HeaderComponent } from '../components/header/header.component';
import { CommonModule,Location  } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { CommonHeaderComponent } from '../components/common-header/common-header.component';
import { GlobalSearchComponent } from '../components/global-search/global-search.component';
register();
@Component({
  selector: 'app-all-categories',
  templateUrl: './all-categories.page.html',
  styleUrls: ['./all-categories.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent, CommonHeaderComponent, GlobalSearchComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AllCategoriesPage implements OnInit {
  @ViewChildren('vendorSwiper') storeSwiperRefs!: QueryList<ElementRef>;
  @ViewChildren('vendorSwiper2') recommendedSwiperRefs!: QueryList<ElementRef>;
  private activeSwiper: any = null;
  bannerImg: any;
  selectedIndex: number = -1;
  categories: any;
  baseUrl = environment.baseurl;
  categoryOneData: any;
  categorySliders: any[] = [];
  cats: any;
  searchedProduct: any[] = [];
  showSearchResults: boolean = false;
  searchKeyword: string = '';
  selectedGridIndex: number = -1;
  isSearchFocused: boolean = false;
  placeholderHidden: boolean = false;
  showResultedVendors: boolean = false;
  hideCategoryDiv: boolean = false;
  intervalId: any;
  currentText = '';
  animationClass = 'animate__fadeInUp';
  index = 0;
  animationKey = 0;
  Allvendors: any;
  hideDiv = false;
  loading: boolean = true;
  hideFooter = false;
  suggestions = ['bread', 'milk', 'rice', 'tomatoes', 'eggs', 'fruits', 'vegetables', 'meat', 'dairy', 'snacks'];
  constructor(private apiservice: ApiserviceService,private router: Router,private location : Location,private storage: Storage) { 
    this.init();
  }
  
  ngOnInit() {
    this.getAllBannerImg();
    this.getAllCategories();
  }
  async init() {
    await this.storage.create();
  }
  goback(){
    this.location.back();
  }
   onSearchFocusChange(isFocused: boolean) {
    this.hideDiv = isFocused;
    this.hideFooter = isFocused;
    console.log('onfocus change',this.hideFooter)

  }
  // onSearchChange(value: string) {
  //   this.searchKeyword = value;
  //   this.showSearchResults = !!value.trim(); // show results only when there's some input
  
  //   if (this.searchKeyword.trim()) {
  //     this.getSearchedProduct(value);
  //   } else {
  //     this.searchedProduct = [];  
  //     this.showSearchResults = false;
  //     this.isSearchFocused = false;
  //   }
  // }
  // async getSearchedProduct(value: any){
  //   const searchstring = value;
  //   // const searchNum = 2;
  //   const user_id = await this.storage.get('userID');
  //   this.apiservice.get_all_search_product(searchstring,user_id).subscribe((response: any) => {  
  //     if(response){
  //       this.searchedProduct = response.data;
  //       // this.isLoading = false;
  //       console.log('searchedProduct-',this.searchedProduct)
  //     }
  //    },);
  // }
  startAutoplay(index: number, section: 'recommended' | 'store') {
      let swiperEl: any;

      if (section === 'recommended') {
        swiperEl = this.recommendedSwiperRefs.get(index)?.nativeElement;
      } else {
        swiperEl = this.storeSwiperRefs.get(index)?.nativeElement;
      }

      if (!swiperEl || !swiperEl.swiper) {
        console.warn('Swiper element not found or not initialized for index:', index, 'section:', section);
        return;
      }

      // Stop previous swiper if any
      if (this.activeSwiper && this.activeSwiper !== swiperEl.swiper) {
        this.activeSwiper.autoplay?.stop();
      }

      swiperEl.swiper.autoplay?.start();
      this.activeSwiper = swiperEl.swiper;
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

    onSearchChange(value: string) {
    this.searchKeyword = value;
    this.showSearchResults = !!value.trim(); // show results only when there's some input
    
    // Hide placeholder when user starts typing
    if (value.trim()) {
      this.placeholderHidden = true;
      // Stop the rotating suggestions when user starts typing
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  
    if (this.searchKeyword.trim()) {
      this.getSearchedProduct(value);
    } else {
      this.searchedProduct = [];  
      this.showSearchResults = false;
      this.showResultedVendors = false
    }
  }

  onPlaceholderClick() {
    this.placeholderHidden = true;
    // Stop the rotating suggestions when placeholder is hidden
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Focus the input after hiding placeholder
    setTimeout(() => {
      const inputElement = document.querySelector('.search_bar') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  }

  onInputWrapperClick() {
    if (!this.searchKeyword.trim()) {
      this.placeholderHidden = true;
      // Stop the rotating suggestions when placeholder is hidden
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      // Focus the input
      setTimeout(() => {
        const inputElement = document.querySelector('.search_bar') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    }
  }
  onInputFocus() {
    this.placeholderHidden = true;
    // Stop the rotating suggestions when input is focused
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onInputBlur() {
    // Show placeholder again if input is empty and not focused
    if (!this.searchKeyword.trim()) {
      setTimeout(() => {
        if (!document.querySelector('.search_bar:focus')) {
          this.placeholderHidden = false;
          // Restart the rotating suggestions when placeholder is shown again
          if (!this.intervalId) {
            this.startRotatingSuggestions();
          }
        }
      }, 200);
    }
  }
  getAllBannerImg(){
    this.apiservice.get_all_banner_imges().subscribe((response)=>{
       this.bannerImg = response.banners;
    })
  }

  selectCategory2(index: number): void {
    this.selectedIndex = index;
  }
  selectCategory(index: number, category_id: any, category_name: any): void {
    this.selectedIndex = index;
    this.router.navigate(['/sub-categories'], { queryParams: { id: category_id, category_name: category_name } });
  }
  getAllCategories(){
    this.apiservice.get_vendor_by_Cat().subscribe((response: any) => {  
      if(response.success == true ){
        this.categories = response.categories;
        // this.isLoading = false;
         this.loading = false;
        console.log('all cat', response)
      }

      },
    );
  }

  navigateToVendorStore(item: any) {
    console.log(item)
    this.router.navigate(['/store-products'], {
    state: { vendor: item }
  });
  }
  async getVednorByVendorId(vendor_id: any) {
    const user_id = await this.storage.get('userID');;
    return this.apiservice.get_all_vendor_by_VendorId(user_id, vendor_id);
  }

  async getAllVendorsBySearchedResult(search_name: any) {
    this.showSearchResults = false;   // Hide search dropdown
    
    // this.noVendorsFound = false;       // Assume vendors can be shown until proven otherwise
    // this.isLoading = true;             // Show loading state

    const user_id = await this.storage.get('userID');;

    this.apiservice.get_all_vendor_on_searchResult(user_id, search_name).subscribe({
      next: (response) => {
        // this.isLoading = false; // Stop loading

        if (response.success === true) {
          console.log("get Vendor by Searched Result", response);
          this.Allvendors = response.data;
          this.showResultedVendors = true;
          this.showSearchResults = false;
          this.hideCategoryDiv = true;
          // this.noVendorsFound = false; // Vendors found
        } else {
          this.Allvendors = [];
          // this.noVendorsFound = true; // No vendors found
        }
      },
      error: (error) => {
        console.error('API error:', error);
        // this.isLoading = false; // Stop loading
        this.Allvendors = [];
        // this.noVendorsFound = true; // Show "no vendors" message/image
      }
    });
  }
  
  async navigateToVendorSearchedVendors(item: any) {
    if (item.type === 'vendor') {
      console.log('Vendor item', item);

      (await this.getVednorByVendorId(item.id)).subscribe((response) => {
        if (response.success === true) {
          console.log('Vendor by VendorID', response);

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

  getAllvendor(sub: any){

    this.apiservice.get_vendor_by_Cat().subscribe((response)=>{
      if(response){
     console.log('vendor by subcat',response)
      }
    })
  }
  navigateToSubCAtProducts(subCatId: any, category_name: any, type: any){
    this.router.navigate(['/inner-product-page'], { queryParams: { id: subCatId, type: type ,category_name:category_name} });
  }

}
