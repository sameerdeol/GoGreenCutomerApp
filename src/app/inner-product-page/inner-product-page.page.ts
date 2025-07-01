import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule,Location } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
register();
@Component({
  selector: 'app-inner-product-page',
  templateUrl: './inner-product-page.page.html',
  styleUrls: ['./inner-product-page.page.scss'],
  standalone: true,
    imports: [IonicModule, FormsModule , CommonModule, FooterTabsComponent], 
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InnerProductPagePage implements OnInit {
  isFilterVisible: boolean = false;
  addToCartVisible: boolean = true;
  itemCount: number = 0;
  userID: any;
  categories: any;
  allfeaturesproducts: any;
  activeCategory: string | null = 'Discount';
  activeDropdown: string | null = null; // Stores currently open dropdown
  selectedFilters: { [key: string]: string[] } = {}; // Stores selections
  baseUrl = environment.baseurl;
  categoryId: any;
  allProducts: any;
  type: any;

  totalQuantity: number = 0;
  totalAmount: number = 0;

  allbrands: any;
  cartItems: any[] = [];
  isAddedMap: { [key: string]: boolean } = {}; 
  categoryName: any;
  showBrandDiv: boolean = true;
  searchKeyword: string = '';
  searchedProduct: any[]=[];
  showSearchResults: boolean = false;

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
  PrinAllBrands: any;
  cat_type: any;
  filteredProducts: any[] = [];
  constructor(private router: Router,private storage: Storage, private apiservice: ApiserviceService,private route: ActivatedRoute,private location: Location) {
    this.init();
  }
  products = [
    {
      name: 'Potato',
      description: 'Lorem ipsum is simply dummy text...',
      price: '$15 / 1kg',
      image: 'assets/potato.svg',
      isFavorite: false,
      discount: ''
    },
    {
      name: 'Galbani Mozzarella',
      description: 'Lorem ipsum is simply dummy text...',
      price: '$10 / 1Pack',
      image: 'assets/potato.svg',
      isFavorite: true,
      discount: ''
    },
    {
      name: 'Galbani Mozzarella',
      description: 'Lorem ipsum is simply dummy text...',
      price: '$15 / 1kg',
      image: 'assets/potato.svg',
      isFavorite: true,
      discount: '20% off'
    }
  ];
  async init() {
    await this.storage.create();
  }
  goBack() {
    this.location.back();
    // this.router.navigate(['/home']);
  }
  async ngOnInit() {
    const user_id = await this.storage.get('userID');
    this.userID = user_id;
  
    this.getAllbrandsForFilter();
    this.getAllCategories();
  
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['id'];
      const heading = params['heading'];
      console.log('heading',heading)
      if(heading){
        this.categoryName = heading;
      }else{
        this.categoryName = params['category_name'];
      }
     
      this.type = params['type']; // Retrieve the type from query params
      this.cat_type = params['cat_type'];
  
      console.log("Category ID:", this.categoryId);
      console.log("Category Name:", this.categoryName);
      console.log("Type:", this.type);
  
      // Call appropriate function based on cat_type or type
      if (this.type === 'subCatID') {
        this.getAllProductBysubcatID();
      } else if (this.type === 'brandProducts') {
        this.getbrandRelatedProduct();
      } else if (this.type === 'AllbrandProducts') {
        this.getAllbrands();
        this.showBrandDiv = false;
      } else {
        // Handle feature or deal types within the default block
        switch (this.type) {
          case 'featuresProduct':
            this.getAllFeaturesProducts();
            break;
          case 'dealsProduct':
            this.getAllweeklyDeals();
            break;
          default:
            this.getAllProductByCatID();
            break;
        }
      }
    });
  }
  navigateToViewCart(){
    this.router.navigate(['/view-cart']);
  }
  async ionViewWillEnter() {
    await this.loadCartFromStorage(); 
    const storedCart = await this.storage.get('cartItems');
    this.cartItems = storedCart || [];
  
    this.totalQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Show popup if there are items in the cart
    this.showCartPopup = this.totalQuantity > 0;
   
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
  onSearchChange(value: string) {
    this.searchKeyword = value;
    this.showSearchResults = !!value.trim(); // show results only when there's some input
  
    if (this.searchKeyword.trim()) {
      this.getSearchedProduct(value);
    } else {
      this.searchedProduct = [];  
      this.showSearchResults = true;
    }
  }
  getSearchedProduct(value: any){
    const searchstring = value;
    // const searchNum = 1;
    this.apiservice.get_all_search_product(searchstring,this.userID).subscribe((response: any) => {  
      if(response){
        this.searchedProduct = response.data;
        // this.isLoading = false;
        console.log('searchedProduct-',this.searchedProduct)
      }
     },);
  }
  getAllbrands(){
    this.apiservice.get_all_brands().subscribe((response)=>{
      if(response){
        const heading = "Popular Brands"
        this.allProducts = response.productBrands;
        this.allProducts.forEach((deal: { heading: any; }) => {
          deal.heading = heading; // Add the heading to each item
        });
        // this.isLoading = false;
        console.log('All brands-',this.allProducts)
      }

    })
  }
  getAllCategories(){
    const is_web = false;
    this.apiservice.get_all_categories(is_web).subscribe((response: any) => {  
      if(response){
        this.Allcategories = response.categories;
        // this.isLoading = false;
        // console.log('cat-',this.Allcategories)
      }

      },
    );
  }
  getAllbrandsForFilter(){
    this.apiservice.get_all_brands().subscribe((response)=>{
      if(response){
        this.PrinAllBrands = response.productBrands;
        // console.log('All brands For Filter-',this.PrinAllBrands)
      }

    })
  }

  async addToCart(product: any) {
    const existingItem = this.cartItems.find(item => item.id === product.id);
     console.log('product title',product.title)
     console.log('product subtitle',product.subtitle)
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
    // this.showPopup();
    this.isAddedMap[product.id] = true;
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
      }
  
      await this.storage.set('cartItems', this.cartItems);
      console.log('❌ Removed:', this.cartItems);
    }
    if (this.cartItems.length === 0) {
      this.showCartPopup = false;
    }
    this.updateTotalQuantity();

  }
  showPopup() {
    this.showCartPopup = true;
  }
  getQuantity(productId: number): number {
    const item = this.cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  }
  updateTotalQuantity() {
    this.totalQuantity = this.cartItems.reduce((total, item) => total + item.quantity, 0);
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
    // if (this.cartItems.length === 0) {
    //   this.showCartPopup = false;
    // }
    console.log('🛒 Cart loaded from storage:', this.cartItems);
  }

  toggleFilter() {
    this.isFilterVisible = !this.isFilterVisible;
  }
  applyFilter() {
    this.selectedBrandIds = [...this.tempSelectedBrandIds];
    this.selectedDiscountThresholds = [...this.tempSelectedDiscountThresholds];
    this.selectedPriceRanges = [...this.tempSelectedPriceRanges];
    this.selectedCategoryIds = [...this.tempSelectedCategoryIds];
    this.selectedDeliveryTypes = [...this.tempSelectedDeliveryTypes];
  
    this.getbrandRelatedProduct();
    this.getAllProductBysubcatID();
    this.getAllweeklyDeals();
    this.isFilterVisible = false;
    // this.showCartPopup = true;
  }
  closeFilter(event: Event) {
    event.stopPropagation();
    this.isFilterVisible = false;
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
    // this.getAllFeaturesProducts();
    this.getAllProductBysubcatID();
    this.getAllProductBysubcatID();
    this.getAllweeklyDeals();
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
  showCategory(category: string) {
    if (this.activeCategory !== category) {
      this.activeCategory = category; // Open category if different
    }
  }

  // Ensures only one dropdown is open at a time
  toggleDropdown(dropdownName: string) {
    this.activeDropdown = this.activeDropdown === dropdownName ? null : dropdownName;
  }

  // Handles checkbox selection for different dropdowns
  onFilterChange(event: any, dropdownName: string, value: string) {
    if (!this.selectedFilters[dropdownName]) {
      this.selectedFilters[dropdownName] = [];
    }

    if (event.target.checked) {
      this.selectedFilters[dropdownName].push(value);
    } else {
      this.selectedFilters[dropdownName] = this.selectedFilters[dropdownName].filter(filter => filter !== value);
    }
    console.log("Selected Filters:", this.selectedFilters);
  }

  // Apply selection and close dropdown
  applySelection() {
    console.log("Final Selected Filters:", this.selectedFilters);
    this.activeDropdown = null;
  }
  getAllFeaturesProducts() {
    const userID = this.userID;
  
    this.apiservice.get_all_features_product(userID).subscribe((response) => {
      if (response && response.data) {
        let filteredProducts = response.data;
  
        // Filter by brand
        if (this.selectedBrandIds.length > 0) {
          filteredProducts = filteredProducts.filter((product: { brand_id: number; }) =>
            this.selectedBrandIds.includes(product.brand_id)
          );
        }
  
        // Filter by discount
        if (this.selectedDiscountThresholds.length > 0) {
          filteredProducts = filteredProducts.filter((product: { discount_percent: number; }) =>
            this.selectedDiscountThresholds.some(threshold =>
              product.discount_percent >= threshold
            )
          );
        }
  
        // Filter by price range
        if (this.selectedPriceRanges.length > 0) {
          filteredProducts = filteredProducts.filter((product: { price: number; }) =>
            this.selectedPriceRanges.some(range =>
              product.price >= range.min && product.price <= range.max
            )
          );
        }
  
        // Filter by category
        if (this.selectedCategoryIds.length > 0) {
          filteredProducts = filteredProducts.filter((product: { category_id: any; }) =>
            this.selectedCategoryIds.includes(Number(product.category_id))
          );
        }
  
        // Filter by delivery type
        if (this.selectedDeliveryTypes.length > 0) {
          filteredProducts = filteredProducts.filter((product: { fast_delivery_available: number; }) =>
            this.selectedDeliveryTypes.includes(product.fast_delivery_available)
          );
        }
  
        this.allProducts = response.data;
        this.filteredProducts = filteredProducts;
  
        console.log('Filtered featured products:', this.filteredProducts);
      }
    });
  }
  
  getAllProductByCatID(){
    const userID = this.userID;
    const catID = this.categoryId;
    console.log('cat-id',catID)
    console.log('this.type',this.type)
    this.apiservice.get_all_product_by_catID(catID,userID).subscribe((response)=>{
      if(response){
        this.filteredProducts = response.data;
        console.log('All Products:', this.allProducts);   
 
      }
      
    })
  }
  getAllweeklyDeals() {
    const userID = this.userID;
    console.log('allweeklydeals=run',)
    this.apiservice.get_all_weekly_deals(userID).subscribe((response) => {
      console.log('allweeklydeals=',response)
      if (response && response.data) {
        let filteredProducts = response.data;
  
        // Apply filters
        if (this.selectedBrandIds.length > 0) {
          filteredProducts = filteredProducts.filter((product: { brand_id: number; }) =>
            this.selectedBrandIds.includes(product.brand_id)
          );
        }
  
        if (this.selectedDiscountThresholds.length > 0) {
          filteredProducts = filteredProducts.filter((product: { discount_percent: number; }) =>
            this.selectedDiscountThresholds.some(threshold =>
              product.discount_percent >= threshold
            )
          );
        }
  
        if (this.selectedPriceRanges.length > 0) {
          filteredProducts = filteredProducts.filter((product: { price: number; }) =>
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
          filteredProducts = filteredProducts.filter((product: { fast_delivery_available: number; }) =>
            this.selectedDeliveryTypes.includes(product.fast_delivery_available)
          );
        }
  
        this.allProducts = response.data;
        this.filteredProducts = filteredProducts;
  
        console.log('Filtered weekly deal products:', this.filteredProducts);
      }
    });
  }
  


  async navigateToproduct(id: any){
    await this.storage.set('product_id', id);
    this.router.navigate(['/product-detail']);
  }
  getbrandRelatedProduct() {
    const userID = this.userID;
    const brandID = Number(this.categoryId);
    console.log(userID, brandID);
  
    this.apiservice.get_product_by_brands(userID, brandID).subscribe((response: any) => {
      if (response && response.data) {
        let filteredProducts = response.data;
  
        // Apply filters
        if (this.selectedBrandIds.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedBrandIds.includes(product.brand_id)
          );
        }
  
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
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedCategoryIds.includes(Number(product.category_id))
          );
        }
  
        if (this.selectedDeliveryTypes.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedDeliveryTypes.includes(product.fast_delivery_available)
          );
        }
  
        this.allProducts = response.data;
        this.filteredProducts = filteredProducts;
        this.categoryName = this.allProducts[0].brand_name;
        console.log('brand name', this.categoryName)
  
        console.log('Filtered brand-related products:', this.filteredProducts);
      }
    });
  }
  
  getAllProductBysubcatID() {
    const userID = this.userID;
    const subcatID = this.categoryId;
    console.log('sub cat-id', subcatID);
  
    this.apiservice.get_all_product_by_subcatID(subcatID, userID).subscribe((response) => {
      if (response && response.data) {
        let filteredProducts = response.data;
  
        // Apply the same filters here
        if (this.selectedBrandIds.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedBrandIds.includes(product.brand_id)
          );
        }
  
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
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedCategoryIds.includes(Number(product.category_id))
          );
        }
  
        if (this.selectedDeliveryTypes.length > 0) {
          filteredProducts = filteredProducts.filter((product: any) =>
            this.selectedDeliveryTypes.includes(product.fast_delivery_available)
          );
        }
  
        // Save both raw and filtered data
        this.allProducts = response.data;
        this.filteredProducts = filteredProducts;
  
        console.log('Filtered SubCat Products:', this.filteredProducts);
      }
    });
  }
  
  toggleFavoritefeatured(features_product: any, product_id: any, is_favourite: any): void {
    features_product.is_favourite = features_product.is_favourite === 1 ? 0 : 1;
    if (features_product.is_favourite === 1) {
      this.markfavourite(product_id);
    } else {
      this.unmarkfavourite(product_id);
    }
  }
 
  markfavourite(product_id: any){
    const user_id = this.userID;
    this.apiservice.add_to_favourties(user_id,product_id).subscribe((response: any) => {  
      if(response){
        // console.log('Favorite API Response-',response)
      }
      },
    );
  }
  unmarkfavourite(product_id: any){
    const user_id = this.userID;
    this.apiservice.remove_to_favourties(user_id,product_id).subscribe((response: any) => {  
      if(response){
        // console.log('Unremove Favorite API Response-',response)
      }
      },
    );
  }
}

