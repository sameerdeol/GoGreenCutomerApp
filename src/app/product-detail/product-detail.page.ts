import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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

  constructor(private location: Location,
    private storage: Storage,
    private router: Router,
    private cartService: CartService,
    private apiservice: ApiserviceService) {
    this.init();

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.productDetails = navigation.extras.state['product'];
      this.product_id = this.productDetails.id;
      console.log("vendorDetails", this.productDetails)
    }
    this.cartSubscription = this.cartService.cartQuantity$.subscribe(quantity => {
      this.cartQuantity = quantity;

    });
  }

  cartQuantity: number = 0;
  private cartSubscription: Subscription = new Subscription();
  selectedAddon: any;
  selectedVariant: any;
  property_detail: any;
  productId: any;
  baseUrl = environment.baseurl;
  currency = environment.currencySymbol;
  userID: any;
  cartState: CartState = {};
  isAdded: any;
  price: number = 0;
  quantity: number = 0;
  totalQuantity: number = 0;
  product_id: number = 0;
  cartItems: any[] = [];
  productDetails: any;
  isAddedMap: { [key: string]: boolean } = {};
  selectedVariatnPrice: number = 0;
  showVariantAndAddons: boolean = false;
  showViewCart: boolean = false;
  rating = 5;
  stars = [1, 2, 3, 4, 5];
  isFavorite: boolean = false;


  async init() {
    await this.storage.create();
  }
  async ionViewWillEnter() {
    await this.loadCartFromStorage(); // Re-load on every visit to this page
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
  async ngOnInit() {
    const user_id = await this.storage.get('userID');
    this.userID = user_id;
    this.cartQuantity = this.cartService.getCurrentQuantity();
    
    if (this.productDetails?.variants?.length > 0) {
      const lower = getLowestPriceVariant(this.productDetails.variants);
      this.selectedVariant = lower.id;
      this.selectedVariatnPrice = Number(lower.price);
    }

    const storedCart = await this.storage.get('cartItems');
    const alreadyInCart = storedCart.some((item: { id: any; }) => item.id === this.productDetails.id);

    if (alreadyInCart) {
      this.showVariantAndAddons = true;
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

  toggleVariant(variant: any, productId: number) {
    this.selectedVariant = variant.id;

    const cartItemIndex = this.cartItems.findIndex(item => item.id === productId);
    if (cartItemIndex !== -1) {
      const cartItem = this.cartItems[cartItemIndex];
      cartItem.variant_id = variant.id;
      cartItem.variant_price = Number(variant.price); // ← add this
      console.log('🧩 Variant added to cart item:', cartItem);
      this.storage.set('cartItems', this.cartItems);
    }
  }

  clear(item: string) {
    if (item === 'Addon') {
      this.selectedAddon = null;

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
    this.selectedAddon = addon.id;
    console.log('selectedAddon', this.selectedAddon);

    const productId = this.productDetails.id;
    const cartItemIndex = this.cartItems.findIndex(item => item.id === productId);

    if (cartItemIndex !== -1) {
      const cartItem = this.cartItems[cartItemIndex];

      // ✅ Make sure variant_id is set properly
      cartItem.variant_id = this.selectedVariant || null;

      // ✅ Only keep the newly selected addon
      cartItem.addons = [{
        addon_id: addon.id,
        price: addon.price
      }];

      console.log('🧩 Updated Addons for product:', cartItem);
      await this.storage.set('cartItems', this.cartItems);
    }
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
        variant_id: this.selectedVariant?.id || null,
        variant_price: Number(this.selectedVariant?.price || '0'),
        vendor_id: product.vendor_id,
        addons: [],
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
      this.showViewCart = true;
    });

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