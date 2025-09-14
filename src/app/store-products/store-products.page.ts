
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { CommonModule, Location } from '@angular/common';
import { SearchModalComponent } from '../components/search-modal/search-modal.component';
import { ApiserviceService } from '../services/apiservice.service';
import { CartService } from '../services/cart.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';
import { FilterModalComponent } from '../components/filter-modal/filter-modal.component';
import { toggleFavourite } from '../utils/utils';
import { Share } from '@capacitor/share';
@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.page.html',
  styleUrls: ['./store-products.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StoreProductsPage implements OnInit {

  allProducts: any[] = [];
  isAddedMap: { [key: string]: boolean } = {};
  totalQuantity: number = 0;
  totalAmount: number = 0;
  cartItems: any[] = [];
  vendorDetails: any;
  user_id: any;
  filters = ['Fast Delivery', '4.0+', 'High to Low'];
  expandedProducts: { [key: string]: boolean } = {}; // Track expanded state per product
  animateCart: boolean = false;
  cartQuantity: number = 0;
  private cartSubscription: Subscription = new Subscription();
  currency = environment.currencySymbol;
  selectedFilters: string[] = [];
  vendor_id: any;
  selectedFilterCount: any;
  showViewCart: boolean = false;
  isVendorOpen: any;
  filterData = {
    price: null as string | null,
    discount: null as string | null,
    delivery: null as string | null,
    rating: null as string | null
  };

  constructor(private router: Router,
    private apiservice: ApiserviceService,
    private cartService: CartService,
    private storage: Storage,
    private location: Location,
    private modalController: ModalController,
    private modalCtrl: ModalController,
    private alertController: AlertController) {

    this.init();
    // this.user_id = await this.storage.get('userID')
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const vendor = navigation.extras.state['vendor'];
      const userID = navigation.extras.state['user_id'];
      this.vendor_id = vendor.vendor_id;
      this.getAllProductsByVendor(this.vendor_id,userID);
      this.vendorDetails = vendor;
      this.isVendorOpen = this.vendorDetails.is_vendor_opened;
      // console.log("vendorDetails", this.vendorDetails)
    }

    this.cartSubscription = this.cartService.cartQuantity$.subscribe(quantity => {
      this.cartQuantity = quantity;
      // console.log('🛒 Footer received cart quantity update:', quantity);
    });
  }
  async init() {
    await this.storage.create();
  }
  toggleSlideFilter(filter: string) {
    if (this.selectedFilters.includes(filter)) {
      this.selectedFilters = this.selectedFilters.filter(f => f !== filter);
    } else {
      this.selectedFilters.push(filter);
    }
    this.updateFilterDataFromSlides();
  }
  removeSlideFilter(event: Event, filter: string) {
    event.stopPropagation();
    this.selectedFilters = this.selectedFilters.filter(f => f !== filter);
    this.updateFilterDataFromSlides();
  }
  updateFilterDataFromSlides() {
    this.filterData = { price: null, discount: null, delivery: null, rating: null };

    this.selectedFilters.forEach(filter => {
      if (filter.includes('% Off')) {
        this.filterData.discount = filter;
      } else if (filter.toLowerCase().includes('to')) {
        this.filterData.price = filter;
      } else if (filter.toLowerCase().includes('delivery')) {
        this.filterData.delivery = filter;
      } else if (filter.includes('+')) {
        this.filterData.rating = filter;
      }
    });

    // console.log('Selected Filters JSON:', this.filterData);
    this.updateSelectedFilterCount();
    this.filterProducts();
  }
  updateFilterData() {
    // Reset JSON
    this.filterData = { price: null, discount: null, delivery: null, rating: null };

    // Map selected filters to JSON keys
    this.selectedFilters.forEach(filter => {
      if (filter.includes('% Off')) {
        this.filterData.discount = filter;
      } else if (filter.toLowerCase().includes('to')) {
        this.filterData.price = filter;
      } else if (filter.toLowerCase().includes('delivery')) {
        this.filterData.delivery = filter;
      } else if (filter.includes('+')) {
        this.filterData.rating = filter;
      }
    });
    this.updateSelectedFilterCount();
    // console.log('Selected Filters JSON:', this.filterData);
    this.filterProducts();
  }
  filterProducts(){
    const payload: any = {
    priceSort: this.filterData.price,
    discount: this.filterData.discount,
    deliveryType: this.filterData.delivery,
    rating: this.filterData.rating,
    vendor_id: this.vendor_id,
  };
    // console.log('payload',payload)
    this.apiservice.filterProducts(payload).subscribe((response)=>{
      if(response){
        //  console.log('filtered Products',response)
         this.allProducts = response;
      }
    })
  }
  async selectFilter(filter: string) {
    if (filter === 'Filters') {
      const modal = await this.modalCtrl.create({
        component: FilterModalComponent,
        cssClass: 'half-screen-modal',
        initialBreakpoint: 0.5,
        componentProps: {
          currentFilters: { ...this.filterData }
        }
      });

      modal.onDidDismiss().then(result => {
      const data = result.data;
      if (data) {
        this.filterData = data.filters || {};
        this.selectedFilterCount = data.count || 0;

        if (this.selectedFilterCount > 0) {
          // console.log('Applied Filters from modal:', this.filterData);
          this.syncFiltersFromModal(this.filterData);
        } else {
          this.clearFilterData();
        }
      }
    });

      await modal.present();
      return;
    }

    this.toggleSlideFilter(filter);
  }
  clearFilterData() {
    this.filterData = { price: null, discount: null, delivery: null, rating: null };
    this.selectedFilters = [];
     this.selectedFilterCount = 0; 
  }
  updateSelectedFilterCount() {
  this.selectedFilterCount = Object.values(this.filterData).filter(v => v).length;
  }
  isFilterActive(): boolean {
    return Object.values(this.filterData).some(v => v);
  }
  syncFiltersFromModal(filters: any) {
    this.filterData = { ...filters };
    this.selectedFilters = [];

    if (filters.discount) this.selectedFilters.push(filters.discount);
    if (filters.price) this.selectedFilters.push(filters.price);
    if (filters.delivery) this.selectedFilters.push(filters.delivery);
    if (filters.rating) this.selectedFilters.push(filters.rating);
    console.log('Selected Filters from Modal:', this.selectedFilters);

    // Call updateFilterData to ensure the filterData object is properly updated
    this.updateFilterData();
  }
  async openSearchModal() {
    const modal = await this.modalController.create({
      component: SearchModalComponent,
      cssClass: 'search-modal',
      backdropDismiss: true,
      componentProps: {
      vendor_id: this.vendor_id   // ✅ pass vendor_id here
    }
    });

    await modal.present();
  }

  toggleExpand(productId: string) {
    this.expandedProducts[productId] = !this.expandedProducts[productId];
  }

  isExpanded(productId: string): boolean {
    return this.expandedProducts[productId] || false;
  }

  goback() {
    this.location.back();
  }

  async ngOnInit() {
    this.cartQuantity = this.cartService.getCurrentQuantity();
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  navigateToProduct(product: any) {
    this.router.navigate(['/product-detail'], {
      state: { product: product,
             vendorStatus: this.isVendorOpen,
             vendorDetails: this.vendorDetails
       }
    });
  }

  navigateToOrders() {
    this.router.navigate(['/view-cart']);
  }
  async shareContent() {
    await Share.share({
      title: 'check this product',
      text: 'Check out this amazing Grocesory app!',
      url: 'https://your-app-link.com',
      dialogTitle: 'Share via'
    });
  }
  async ionViewWillEnter() {
    await this.loadCartFromStorage();
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];

    // Update cart service with current cart items
    this.cartService.setCartItems(this.cartItems);
    this.totalQuantity = this.cartService.getCurrentQuantity();
  }
  
  async loadCartFromStorage() {
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];

    // Update cart service with loaded cart items
    this.cartService.setCartItems(this.cartItems);
    this.totalQuantity = this.cartService.getCurrentQuantity();

    // Update isAddedMap
    this.isAddedMap = {};
    this.showViewCart = false;
    this.cartItems.forEach(item => {
      this.isAddedMap[item.id] = true;
      this.showViewCart = true;
      this.showViewCart = true;
    });

    // console.log('🛒 Cart loaded from storage:', this.cartItems);
  }

  navigateToViewCart() {
    this.router.navigate(['/view-cart']);
  }

  async updateTotalQuantity() {
    this.totalQuantity = this.cartItems.reduce((total, item) => total + item.quantity, 0);
    await this.storage.set('totalQuantityFromCart', this.totalQuantity)
    // Update cart service
    this.cartService.setCartItems(this.cartItems);
  }
  getAllProductsByVendor(vendor_id: any,user_id:any) {
    const searchTerm = "";
    this.apiservice.get_allproductsByVendorID(vendor_id, searchTerm, user_id).subscribe((response) => {
      if (response.success == true) {
        this.allProducts = response.product;
        // console.log("all vendor products", this.allProducts)
      }
    })
  }

  async addToCart(product: any) {
    console.log('this.isVendorOpen',this.isVendorOpen)
if (!this.isVendorOpen) {
  const alert = await this.alertController.create({
    header: 'Vendor Closed',
    message: 
      `This vendor is currently closed. Please come back during opening hours.\n\n` +
      `Opens at: ${this.vendorDetails?.open_time || 'N/A'}\n` +
      `Closes at: ${this.vendorDetails?.close_time || 'N/A'}`,
    buttons: ['OK']
  });
  await alert.present();
  return;
}
    // Check if cart has items from a different vendor
    if (this.cartItems.length > 0) {
      const firstCartItem = this.cartItems[0];
      if (firstCartItem.vendor_id !== product.vendor_id) {
        // Clear cart items from different vendor
        console.log('🔄 Clearing cart items from different vendor:', firstCartItem.vendor_id);

        // Reset isAddedMap for all existing cart items
        this.cartItems.forEach(item => {
          this.isAddedMap[item.id] = false;
        });

        // Clear the cart
        this.cartItems = [];
      }
    }

    const existingItem = this.cartItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        vendor_id: product.vendor_id,
        category_id: product.category_id,
        id: product.id,
        quantity: 1,
        price: product.price,
        image: product.featured_image,
        title: product.name, // 👈 add name
        subtitle: product.description,
        variant_price: Number(product.price),
      });
    }
    this.animateCart = true;

    this.updateTotalQuantity();
    this.isAddedMap[product.id] = true;
    this.showViewCart = true;
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
        this.showViewCart = false;
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

  async removeCartStorage() {
    setTimeout(async () => {
      await this.storage.remove('cartItems');
      this.cartItems.forEach(item => {
        // Set isAddedMap to true for each item
        this.isAddedMap[item.id] = false;
        
      });
      this.cartItems = [];

      // Update cart service with empty cart
      this.cartService.setCartItems([]);
    }, 400);
  }

  toggleFav(vendor: any) {
      toggleFavourite(vendor, this.user_id, this.apiservice,'vendor');
  }

}
