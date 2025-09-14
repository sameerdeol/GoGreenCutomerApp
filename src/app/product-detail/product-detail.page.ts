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
    this.route.queryParamMap.subscribe(params => {
    const id = params.get('id');

    if (id) {
      this.product_id = +id;
      // console.log("Product ID from route:", this.product_id);
      this.getProductToDetailsById(this.product_id);

    } else if (navigation?.extras?.state) {
      this.productDetails = navigation.extras.state['product'] ?? null;
      this.product_id = this.productDetails?.id ?? null;
      this.vendorStatus = navigation.extras.state['vendorStatus'] ?? '';
      this.vendorDetails = navigation.extras.state['vendorDetails'] ?? null;
      // console.log("Product ID from state:", this.product_id);
    } else {

      console.warn("No product_id found in route or state");
      this.router.navigate(['/products']); // optional redirect
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
    await this.loadCartFromStorage(); // Re-load on every visit to this page
    // Restore selected state when returning to page
    if (this.productDetails) {
      await this.checkExistingItems();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
   
  }
  getProductToDetailsById(id: any){
    this.apiservice.get_product_details(id).subscribe((response)=>{
      if(response.success === true){
         this.productDetails = response.product;
          console.log('Your Clicked Product Details is :',this.productDetails)
      }
    })
  }
  async checkExistingItems(){
    const storedCart = await this.storage.get('cartItems');
    const existingItem = storedCart.find((item: any) => item.id === this.productDetails?.id);
    console.log('existing item in cart on page load',existingItem)
    if (existingItem) {
        this.showVariantAndAddons = true;
             
        // Restore variant
        if (existingItem.variant_id) {
          this.selectedVariant = existingItem.variant_id;
          this.selectedVariatnPrice = existingItem.variant_price;
          console.log('existingItem.variant_id',existingItem.variant_id)
        }

        // Restore addons (multiple addons support)
        if (existingItem.addons?.length > 0 ) {
          this.selectedAddons = existingItem.addons.map((addon: any) => addon.addon_id);
          console.log('existingItem.selectedAddons',this.selectedAddons)
        } else {
          this.selectedAddons = [];
        }
    }else{
      this.showVariantAndAddons = false;
      this.selectedAddons = [];
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
      console.log('this.selectedVariant',this.selectedVariant)
      this.selectedVariatnPrice = Number(lower.price);
    }
  }
  toggleVariant(variant: any, productId: number) {
    this.selectedVariant = variant.id;
    // this.productState.selectedVariant = variant.id;

    const cartItemIndex = this.cartItems.findIndex(item => item.id === productId);
    if (cartItemIndex !== -1) {
      const cartItem = this.cartItems[cartItemIndex];
      cartItem.variant_id = variant.id;
      cartItem.variant_price = Number(variant.price); // ← add this
      console.log('🧩 Variant added to cart item:', cartItem);
      this.storage.set('cartItems', this.cartItems);
    }
  }
  onVariantChange(event: any) {
  const selectedVariantId = event.detail.value;
  const variant = this.productDetails.variants.find((v: any) => v.id === selectedVariantId);
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
        console.log(`🧹 Cleared addons for product ID ${productId}:`, cartItem);
      }
    }

    console.log('🛒 Cart after clearing:', this.cartItems);
  }
  async toggleAddon(addon: any) {
    const addonId = addon.id;
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

      // ✅ Update addons based on selected addons
      cartItem.addons = this.selectedAddons.map(addonId => {
        const addon = this.productDetails.addons.find((a: any) => a.id === addonId);
        return {
          addon_id: addonId,
          price: addon ? addon.price : 0
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
    return this.selectedAddons.includes(addonId);
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
  const existingItem = this.cartItems.find(item => item.id === product.id);
    if(this.selectedVariant == null || ""){
      this.selectedVariant = product?.variants?.id;
      this.onintialSetVariantId();
    }
     console.log('selected variant when add to cart', this.selectedVariant)
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // Include selected addons when adding to cart
      const selectedAddonsData = this.selectedAddons.map(addonId => {
        const addon = product.addons.find((a: any) => a.id === addonId);
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
        variant_price: Number(this.selectedVariant?.price || '0'),
        vendor_id: product.vendor_id,
        addons: selectedAddonsData,
        title: product.name, // 👈 add name
        subtitle: product.description,
      });
    }
    // this.showPopup();
    this.updateTotalQuantity();
    this.isAddedMap[product.id] = true;
    this.showViewCart = true;
    this.showVariantAndAddons = true;
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
        this.clear('Addon');
        this.selectedAddons = []; // Clear selected addons
        this.selectedVariant = null; // Clear selected variant
        this.onintialSetVariantId();
        this.showVariantAndAddons = false;
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

    // Update isAddedMap
    this.isAddedMap = {};
    this.showViewCart = false;
    this.cartItems.forEach(item => {
      this.isAddedMap[item.id] = true;
      this.showViewCart = true;
      this.showVariantAndAddons = true;
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