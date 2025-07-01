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

  tempSelectedBrandIds: number[] = [];
  tempSelectedDiscountThresholds: number[] = [];
  tempSelectedPriceRanges: { min: number, max: number }[] = [];
  tempSelectedCategoryIds: number[] = [];
  tempSelectedDeliveryTypes: number[] = [];
  showCartPopup: boolean = false;
  isSlidingOut = false;
  async ngOnInit() {
    // const token = await Storage.get({ key: 'userID' });
    this.userID =  await this.storage.get('userID');
    console.log('Wishlist PAge User ID:', this.userID );
    this.getAllFavouriteproducts();
    this.getAllweeklyDeals();
    this.getAllbrands();
    this.getAllweeklyDeals();
    this.getAllCategories();
  }
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
  navigateToback(){
    this.location.back();
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
  toggleSelectAll() {
    this.selectedItems = this.selectAll ? [...this.allfavoriteProducts] : [];
  }
  toggleSelection(item: any) {
    const index = this.selectedItems.findIndex(p => p.id === item.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
  
    // Keep Select All checkbox in sync
    this.selectAll = this.selectedItems.length === this.allfavoriteProducts.length;
  }
  closeFilter(event: Event) {
    event.stopPropagation();
    
    this.isFilterVisible = false;
    this.showCartPopup = true;
  }
  toggleFilter() {
 
    this.isFilterVisible = !this.isFilterVisible;
    this.showCartPopup = false;
  }
  showCategory(category: string) {
    if (this.activeCategory !== category) {
      this.activeCategory = category; // Open category if different
    }
  }
  applyFilter() {
    this.selectedBrandIds = [...this.tempSelectedBrandIds];
    this.selectedDiscountThresholds = [...this.tempSelectedDiscountThresholds];
    this.selectedPriceRanges = [...this.tempSelectedPriceRanges];
    this.selectedCategoryIds = [...this.tempSelectedCategoryIds];
    this.selectedDeliveryTypes = [...this.tempSelectedDeliveryTypes];
  
    this.getAllFavouriteproducts();
    this.isFilterVisible = false;
    this.showCartPopup = true;
  }
  clearAllFilter(){
    console.log('clear')
    this.tempSelectedBrandIds = [];
    this.tempSelectedDiscountThresholds = [];
    this.tempSelectedPriceRanges = [];
    this.tempSelectedCategoryIds = [];
    this.tempSelectedDeliveryTypes = [];

    this.selectedBrandIds = [];
    this.selectedDiscountThresholds = [];
    this.selectedPriceRanges = [];
    this.selectedCategoryIds = [];
    this.selectedDeliveryTypes = [];
    this.getAllFavouriteproducts();
  }
  // Ensures only one dropdown is open at a time
  toggleDropdown(dropdownName: string) {
    this.activeDropdown = this.activeDropdown === dropdownName ? null : dropdownName;
  }
  isItemSelected(item: any): boolean {
    return this.selectedItems.some(p => p.id === item.id);
  }
 
  updateSelectedItems() {
    this.selectedItems = this.allfavoriteProducts.filter((item: { selected: any; }) => item.selected);
    this.selectAll = this.selectedItems.length === this.allfavoriteProducts.length;
  }
  getAllCategories(){
    const is_web = false;
    this.apiservice.get_all_categories(is_web).subscribe((response: any) => {  
      if(response){
        this.Allcategories = response.categories;
        // this.isLoading = false;
        console.log('cat-',this.Allcategories)
      }

      },
    );
  }
  deleteSelected() {
    const user_id = this.userID;
  
    this.selectedItems.forEach((item) => {
      this.apiservice.remove_to_favourties(user_id, item.id).subscribe((response: any) => {
        if (response && response.success === true) {
          // ❌ Remove from favorites list
          this.allfavoriteProducts = this.allfavoriteProducts.filter((p: any) => p.id !== item.id);
  
          // 🩶 Also update is_favourite in deals (or any other list it's shown)
          const dealIndex = this.allweeklydeals.findIndex((deal: any) => deal.id === item.id);
          if (dealIndex !== -1) {
            this.allweeklydeals[dealIndex].is_favourite = 0;
          }
  
          // Optional cleanup
          this.selectedItems = this.selectedItems.filter(p => p.id !== item.id);
          this.selectAll = false;
          this.updateSelectedItems();
          this.cdr.detectChanges();
        }
      });
    });
  }
  isPriceRangeSelected(min: number, max: number): boolean {
    return this.tempSelectedPriceRanges.some(r => r.min === min && r.max === max);
  }
  onTempBrandChange(event: Event, brandId: number) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.tempSelectedBrandIds.push(brandId);
    } else {
      this.tempSelectedBrandIds = this.tempSelectedBrandIds.filter(id => id !== brandId);
    }
    console.log('onTempBrandChange',this.tempSelectedBrandIds)
  }
  onTempDiscountFilterChange(event: Event, threshold: number) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.tempSelectedDiscountThresholds.push(threshold);
    } else {
      this.tempSelectedDiscountThresholds = this.tempSelectedDiscountThresholds.filter(val => val !== threshold);
    }
  }
  onTempPriceRangeChange(event: Event, range: { min: number, max: number }) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.tempSelectedPriceRanges.push(range);
    } else {
      this.tempSelectedPriceRanges = this.tempSelectedPriceRanges.filter(
        r => !(r.min === range.min && r.max === range.max)
      );
    }
  }

  onTempCategoryChange(event: Event, categoryId: number) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.tempSelectedCategoryIds.push(categoryId);
    } else {
      this.tempSelectedCategoryIds = this.tempSelectedCategoryIds.filter(id => id !== categoryId);
    }
  }
  onTempDeliveryTypeChange(event: Event, deliveryType: number) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.tempSelectedDeliveryTypes.push(deliveryType);
    } else {
      this.tempSelectedDeliveryTypes = this.tempSelectedDeliveryTypes.filter(type => type !== deliveryType);
    }
  }
  getAllFavouriteproducts() {
    const user_id = this.userID;
  
    this.apiservice.get_all_favourite_product(user_id).subscribe((response) => {
      if (response && response.data) {
        let filteredProducts = response.data;
  
        // Filter by brand if selected
        if (this.selectedBrandIds.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedBrandIds.includes(product.brand_id)
          );
        }
  
        // Filter by discount if selected
        if (this.selectedDiscountThresholds.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedDiscountThresholds.some(threshold =>
              product.discount_percent >= threshold
            )
          );
        }

        if (this.selectedPriceRanges.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedPriceRanges.some(range =>
              product.price >= range.min && product.price <= range.max
            )
          );
        }

        if (this.selectedCategoryIds.length > 0) {
          filteredProducts = filteredProducts.filter((product: { category_id: any; }) =>
            this.selectedCategoryIds.includes(Number(product.category_id))
          );
        }
        if (this.selectedDeliveryTypes.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedDeliveryTypes.includes(product.fast_delivery_available)
          );
        }
  
        this.allfavoriteProducts = filteredProducts;
        console.log('Filtered favourite products:', this.allfavoriteProducts);
      }
    });
  }
  
  getAllbrands(){
    this.apiservice.get_all_brands().subscribe((response)=>{
      this.allbrands = response.productBrands;
      console.log('this.allbrands',this.allbrands)
    })
  }
  navigateToinerAllDeals(category_id: any, dealsProduct: any){
    this.router.navigate(['/inner-product-page'], { queryParams: { id: category_id, type: dealsProduct } });
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

  navigateToBrands(brandID: Number){
    console.log('brandID--',brandID)
    this.router.navigate(['/inner-product-page'], { queryParams: { id: brandID, type: 'brandProducts' } });
  }
 

  toggleFavoritefeatured(product: any, product_id: any, is_favourite: any): void {
    const user_id = this.userID;
  
    if (is_favourite === 0) {
      // ADD to favorites
      this.apiservice.add_to_favourties(user_id, product_id).subscribe((response: any) => {
        if (response && response.success === true) {
          product.is_favourite = 1;
  
          // 💡 Add to wishlist array
          const alreadyExists = this.allfavoriteProducts.some((p: any) => p.id === product_id);
          if (!alreadyExists) {
            this.allfavoriteProducts.push(product);
          }
  
          this.updateSelectedItems();
          this.cdr.detectChanges();
        }
      });
    } else {
      // REMOVE from favorites
      this.apiservice.remove_to_favourties(user_id, product_id).subscribe((response: any) => {
        if (response && response.success === true) {
          product.is_favourite = 0;
  
          // ❌ Remove from favorites list
          this.allfavoriteProducts = this.allfavoriteProducts.filter((p: any) => p.id !== product_id);
  
          this.updateSelectedItems();
          this.cdr.detectChanges();
        }
      });
    }
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
  markfavourite(product_id: any){
    const user_id = this.userID;
    this.apiservice.add_to_favourties(user_id,product_id).subscribe((response: any) => {  
      if(response.success === true){
        console.log('Favorite API Response-',response)
        
      }
      },
    );
  }
  unmarkfavourite(product_id: any) {
    const user_id = this.userID;
    this.apiservice.remove_to_favourties(user_id, product_id).subscribe((response: any) => {
      if (response.success === true) {
        console.log('Unremove Favorite API Response -', response);
        this.allfavoriteProducts = this.allfavoriteProducts.filter((p: { id: any; }) => p.id !== product_id);
        this.updateSelectedItems();
        this.cdr.detectChanges(); // keep selection in sync
      } else {
        console.warn('Failed to remove from favorites:', response);
      }
    });
  }
  async navigateToproduct(id: any){
    await this.storage.set('product_id', id);
    this.router.navigate(['/product-detail']);
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
  
  showPopup() {
    this.showCartPopup = true;
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
}
