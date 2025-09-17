import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { CommonModule, Location } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { CommonHeaderComponent } from '../components/common-header/common-header.component';
import { getLowestPriceVariant, toggleFavourite } from 'src/app/utils/utils';
import { CartService } from '../services/cart.service';
import { Subscription } from 'rxjs';
register();

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  providers: [Storage],
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent, CommonHeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductDetailPage implements OnInit {
  cartQuantity: number = 0;
  private cartSubscription: Subscription = new Subscription();
  selectedAddons: any[] = []; // Changed to array for multiple addons
  selectedVariant: any;
  selectedVariant1: any;
  property_detail: any;
  vendorStatus: any = null;
  productId: any;
  baseUrl = environment.baseurl;
  currency = environment.currencySymbol;
  vendorDetails: any;
  userID: any;
  cartState: CartState = {};
  isAdded: any;
  price: number = 0;
  quantity: number = 0;
  totalQuantity: number = 0;
  product_id: number = 0;
  cartItems: any[] = [];
  productDetails: any = null;
  isAddedMap: { [key: string]: boolean } = {};
  selectedVariatnPrice: number = 0;
  showVariantAndAddons: boolean = false;
  showViewCart: boolean = false;
  rating = 5;
  stars = [1, 2, 3, 4, 5];
  isFavorite: boolean = false;
   isLoading: boolean = true;

  constructor(private location: Location,
    private storage: Storage,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private apiservice: ApiserviceService,
    private alertController: AlertController,
    ) {
    this.init();
    this.checkExistingItems();
    const navigation = this.router.getCurrentNavigation();
    this.isLoading = true;
    this.route.queryParamMap.subscribe(params => {
    const id = params.get('id');
    console.log('[ProductDetail] constructor queryParamMap id =', id);

    if (id) {
      const newProductId = +id;
      // Always load the product from route parameters (this takes priority)
      this.product_id = newProductId;
      // console.log("Product ID from route:", this.product_id);
      
      // Get additional data from state if available
      if (navigation?.extras?.state) {
        this.vendorStatus = navigation.extras.state['vendorStatus'] ?? '';
        this.vendorDetails = navigation.extras.state['vendorDetails'] ?? null;
        // Use state product data if available, otherwise fetch from API
        if (navigation.extras.state['product']?.id === newProductId) {
          this.resetProductState();
          this.productDetails = navigation.extras.state['product'];
          this.checkExistingItems();
          this.isLoading = false;
        } else {
          this.getProductToDetailsById(this.product_id);
        }
      } else {
        this.getProductToDetailsById(this.product_id);
      }

    } else if (navigation?.extras?.state) {
      const stateProductId = navigation.extras.state['id'] ?? navigation.extras.state['product']?.id ?? null;
      if (stateProductId) {
        this.product_id = stateProductId;
        this.productDetails = navigation.extras.state['product'] ?? null;
        this.vendorStatus = navigation.extras.state['vendorStatus'] ?? '';
        this.vendorDetails = navigation.extras.state['vendorDetails'] ?? null;
        console.log("Product ID from state:", this.product_id);
        if (this.productDetails) {
          this.resetProductState();
          this.productDetails = navigation.extras.state['product'];
          this.checkExistingItems();
          this.isLoading = false;
        }
      }
    } else {
      console.warn("No product_id found in route or state");
      this.router.navigate(['/products']); // optional redirect
      this.isLoading = false;
    }
  });
    this.cartSubscription = this.cartService.cartQuantity$.subscribe(quantity => {
    this.cartQuantity = quantity;
    });
  }

  async init() {
    await this.storage.create();
  }

  async ionViewWillEnter() {
    await this.loadCartFromStorage(); 

    // Always check route snapshot on entry
    const idFromRoute = this.route.snapshot.queryParamMap.get('id');
    console.log('[ProductDetail] ionViewWillEnter idFromRoute =', idFromRoute);
    if (idFromRoute) {
      const numericId = Number(idFromRoute);
      if (!this.product_id || this.product_id !== numericId) {
        this.product_id = numericId;
        this.getProductToDetailsById(this.product_id);
        return;
      }
    }

    // Fallback: use navigation state or lastProductId if no id in route
    if (!idFromRoute) {
      const stateId = this.router.getCurrentNavigation()?.extras?.state?.['id'];
      if (stateId) {
        this.product_id = Number(stateId);
        this.getProductToDetailsById(this.product_id);
        return;
      }
      const lastProductId = await this.storage.get('lastProductId');
      console.log('[ProductDetail] ionViewWillEnter lastProductId =', lastProductId);
      if (lastProductId) {
        this.product_id = Number(lastProductId);
        this.getProductToDetailsById(this.product_id);
        return;
      }
    }

    // If we already have productDetails, restore selected state
    if (this.productDetails) {
      await this.checkExistingItems();
    } else if (!idFromRoute) {
      // Avoid endless loading if nothing to load
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
   
  }

  resetProductState(): void {
    // Reset all product-specific state
    this.selectedAddons = [];
    this.selectedVariant = null;
    this.selectedVariatnPrice = 0;
    this.showVariantAndAddons = false;
    // Don't reset showViewCart here - it should show if ANY items are in cart
    this.productDetails = null;
    
    // Don't reset isAddedMap as it should persist across products
    // this.isAddedMap = {};
  }
  getProductToDetailsById(id: any){
    // Reset state when loading a different product
    this.resetProductState();
     this.isLoading = true; 
    
    this.apiservice.get_product_details(id).subscribe({
      next: async (response) => {
        console.log('[ProductDetail] API response for id', id, response);
        if(response.success === true){
           this.productDetails = response.product;
            // After product details are loaded, check existing items and set default variant
            await this.checkExistingItems();
            // If no existing items, set default variant
            if (!this.selectedVariant && this.productDetails?.variants?.length > 0) {
              this.onintialSetVariantId();
            }
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[ProductDetail] API error for id', id, err);
        this.isLoading = false;
      }
    })
  }
  async checkExistingItems(){
    const storedCart = await this.storage.get('cartItems') || [];
    const existingItem = storedCart.find((item: any) => item.id === this.productDetails?.id);
    console.log('existing item in cart on page load',existingItem)
    
    if (existingItem) {
        this.showVariantAndAddons = true;
        this.isAddedMap[this.productDetails.id] = true;
        this.showViewCart = true;
             
        // Restore variant
        if (existingItem.variant_id) {
          this.selectedVariant = Number(existingItem.variant_id);
          this.selectedVariatnPrice = Number(existingItem.variant_price || 0);
          console.log('Restored variant_id:',existingItem.variant_id)
        } else if (this.productDetails?.variants?.length > 0) {
          // If no variant saved but variants exist, set default
          this.onintialSetVariantId();
        }

        // Restore addons (multiple addons support)
        if (existingItem.addons?.length > 0 ) {
          this.selectedAddons = existingItem.addons.map((addon: any) => Number(addon.addon_id));
          console.log('Restored selectedAddons:',this.selectedAddons)
        } else {
          this.selectedAddons = [];
        }
    } else {
      // No existing item - set defaults
      this.showVariantAndAddons = false;
      this.selectedAddons = [];
      this.selectedVariant = null;
      this.isAddedMap[this.productDetails?.id] = false;
      
      // Set default variant if variants exist
      if (this.productDetails?.variants?.length > 0) {
        this.onintialSetVariantId();
      }
    }
  }
  async ngOnInit() {
    const user_id = await this.storage.get('userID');
    this.userID = user_id;
    this.cartQuantity = this.cartService.getCurrentQuantity();

  }
  onintialSetVariantId(){
     if (this.productDetails?.variants?.length > 0) {
      const lower = getLowestPriceVariant(this.productDetails.variants);
      this.selectedVariant = Number(lower.id);
      console.log('Default variant selected:',this.selectedVariant)
      this.selectedVariatnPrice = Number(lower.price);
      
      // Update cart item if it exists
      const existingItemIndex = this.cartItems.findIndex(item => item.id === this.productDetails.id);
      if (existingItemIndex !== -1) {
        this.cartItems[existingItemIndex].variant_id = this.selectedVariant;
        this.cartItems[existingItemIndex].variant_price = this.selectedVariatnPrice;
        this.storage.set('cartItems', this.cartItems);
      }
    }
  }
  toggleVariant(variant: any, productId: number) {
    this.selectedVariant = Number(variant.id);
    this.selectedVariatnPrice = Number(variant.price);
    // console.log('Variant toggled:', this.selectedVariant, 'Price:', this.selectedVariatnPrice);

    const cartItemIndex = this.cartItems.findIndex(item => item.id === productId);
    if (cartItemIndex !== -1) {
      const cartItem = this.cartItems[cartItemIndex];
      cartItem.variant_id = this.selectedVariant;
      cartItem.variant_price = this.selectedVariatnPrice;
      console.log('🧩 Variant updated in cart item:', cartItem);
      this.storage.set('cartItems', this.cartItems);
    }
  }
  onVariantChange(event: any) {
  const selectedVariantId = Number(event.detail.value);
  const variant = this.productDetails.variants.find((v: any) => Number(v.id) === selectedVariantId);
  if (variant) {
    this.toggleVariant(variant, this.productDetails.id);
  }
  }
  toggleFav(product: any) {
      toggleFavourite(product, this.userID, this.apiservice,'product');
  }
  goBack() {
    this.location.back();
  }
  viewCart(){
    this.router.navigate(['/view-cart']);
  }
  
  setRating(value: number) {
    this.rating = value;
    console.log('⭐ Selected rating:', this.rating);
  }


  clear(item: string) {
    if (item === 'Addon') {
      this.selectedAddons = []; // Clear selected addons array

      const productId = this.productDetails.id;
      const cartItemIndex = this.cartItems.findIndex(item => item.id === productId);

      if (cartItemIndex !== -1) {
        const cartItem = this.cartItems[cartItemIndex];
        cartItem.addons = []; // ✅ Clear all addons
        this.storage.set('cartItems', this.cartItems); // ✅ Persist updated cart
        // console.log(`🧹 Cleared addons for product ID ${productId}:`, cartItem);
      }
    }

    console.log('🛒 Cart after clearing:', this.cartItems);
  }
  async toggleAddon(addon: any) {
    const addonId = Number(addon.id);
    const addonIndex = this.selectedAddons.indexOf(addonId);
    
    if (addonIndex > -1) {
      // Remove addon if already selected
      this.selectedAddons.splice(addonIndex, 1);
    } else {
      // Add addon if not selected
      this.selectedAddons.push(addonId);
    }
    
    console.log('selectedAddons', this.selectedAddons);

    const productId = this.productDetails.id;
    const cartItemIndex = this.cartItems.findIndex(item => item.id === productId);

    if (cartItemIndex !== -1) {
      const cartItem = this.cartItems[cartItemIndex];

      // ✅ Make sure variant_id is set properly
      cartItem.variant_id = this.selectedVariant || null;
      cartItem.variant_price = this.selectedVariatnPrice || 0;

      // ✅ Update addons based on selected addons
      cartItem.addons = this.selectedAddons.map(selectedAddonId => {
        const foundAddon = this.productDetails.addons.find((a: any) => Number(a.id) === selectedAddonId);
        return {
          addon_id: selectedAddonId,
          price: foundAddon ? Number(foundAddon.price) : 0
        };
      });

      console.log('🧩 Updated Addons for product:', cartItem);
      await this.storage.set('cartItems', this.cartItems);
    }
  }
  handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    console.log('Current value:', JSON.stringify(target.value));
  }

  isAddonSelected(addonId: any): boolean {
    return this.selectedAddons.includes(Number(addonId));
  }

  async addToCart(product: any) {
  console.log('this.vendorStatus',this.vendorStatus)
  if (!this.vendorStatus) {
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
  
  // Ensure variant is selected if variants exist
  if (!this.selectedVariant && product?.variants?.length > 0) {
    this.onintialSetVariantId();
  }
  
  // console.log('selected variant when add to cart', this.selectedVariant)
  
  const existingItem = this.cartItems.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
    // Update variant and addons for existing item
    existingItem.variant_id = this.selectedVariant || null;
    existingItem.variant_price = this.selectedVariatnPrice || 0;
    existingItem.addons = this.selectedAddons.map(addonId => {
      const addon = product.addons?.find((a: any) => a.id === addonId);
      return {
        addon_id: addonId,
        price: addon ? addon.price : 0
      };
    });
  } else {
    // Include selected addons when adding to cart
    const selectedAddonsData = this.selectedAddons.map(addonId => {
      const addon = product.addons?.find((a: any) => a.id === addonId);
      return {
        addon_id: addonId,
        price: addon ? addon.price : 0
      };
    });

    this.cartItems.push({
      category_id: product.category_id,
      id: product.id,
      quantity: 1,
      price: product.price,
      image: product.featured_image,
      variant_id: this.selectedVariant || null,
      variant_price: this.selectedVariatnPrice || 0,
      vendor_id: product.vendor_id,
      addons: selectedAddonsData,
      title: product.name,
      subtitle: product.description,
    });
  }
  
  this.updateTotalQuantity();
  this.isAddedMap[product.id] = true;
  this.showViewCart = true;
  this.showVariantAndAddons = true;
  await this.storage.set('cartItems', this.cartItems);
  console.log('🛒 Added to cart:', this.cartItems);
  }

  async removeFromCart(product: any) {
    const index = this.cartItems.findIndex(item => item.id === product.id);

    if (index !== -1) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity -= 1;
      } else {
        this.cartItems.splice(index, 1);
        this.isAddedMap[product.id] = false;
        
        // Check if cart still has items to show view cart
        this.showViewCart = this.cartItems.length > 0;
        
        this.clear('Addon');
        this.selectedAddons = []; // Clear selected addons
        this.selectedVariant = null; // Clear selected variant
        this.selectedVariatnPrice = 0;
        
        // Set default variant if variants exist
        if (product?.variants?.length > 0) {
          this.onintialSetVariantId();
        }
        
        this.showVariantAndAddons = false;
      }

      await this.storage.set('cartItems', this.cartItems);
      console.log('❌ Removed from cart:', this.cartItems);
    }
    this.updateTotalQuantity();
  }
  getQuantity(productId: number): number {
    const item = this.cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  }
  getTotalPrice(product: any): number {
    const cartItem = this.cartItems.find(item => item.id === product.id);
    if (!cartItem) return 0;
    const quantity = cartItem.quantity || 1;
    let total = product.price;

    if (cartItem.variant_price) {
      total = parseFloat(cartItem.variant_price);
    }

    if (cartItem.addons && cartItem.addons.length > 0) {
      cartItem.addons.forEach((addon: { price: any; }) => {
        total += parseFloat(addon.price);
      });
    }
    return parseFloat((total * quantity).toFixed(2)); // ✅ round to 2 decimals
  }

  async updateTotalQuantity() {
    this.totalQuantity = this.cartItems.reduce((total, item) => total + item.quantity, 0);
    await this.storage.set('totalQuantityFromCart', this.totalQuantity);
    this.cartService.setCartItems(this.cartItems); // add quanity gloably 
  }

  async loadCartFromStorage() {
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];
    this.updateTotalQuantity();

    // Update isAddedMap and showViewCart only
    this.isAddedMap = {};
    this.showViewCart = false;
    this.cartItems.forEach(item => {
      this.isAddedMap[item.id] = true;
      this.showViewCart = true;
      // Don't set showVariantAndAddons here - let checkExistingItems handle it for current product only
    });

    // Restore selected state for current product
    if (this.productDetails) {
      await this.checkExistingItems();
    }

    console.log('🛒 Cart loaded from storage:', this.cartItems);
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