import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';

// import { Storage } from '@capacitor/storage';
import { switchMap, map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {
  base_path = 'https://cx.ekarigar.com/delievery-api/';
  
  // API Endpoints login1/appsignup
  allcategories = this.base_path + 'category/fetch-categories';
  allBannerImages = this.base_path + 'banners/app-banners';
  allbrands = this.base_path + 'productbrands/allProduct-brands';
  allSubcategories = this.base_path + 'subcategory/fetch-subcategories';
  allFeaturesProduct = this.base_path + 'products/featuredproducts';
  allWeeklyDeals = this.base_path + 'products/weeklydealproducts';
  productDetail = this.base_path + 'products/productbyid';
  categoryRelatedBrands = this.base_path + 'products/product-brandsbyCategory';
  dynamicCategoryapi = this.base_path + 'dynamiccat/dynamicCategory';
  categoryTwoHomePage = this.base_path + 'dynamiccat/dynamicCategoryDatatwo';
  beautySubCategory = this.base_path + 'subcategory/beautysubcategories';
  loginApi = this.base_path + 'users/appsignup';
  catByCatID = this.base_path + 'subcategory/subcategoriesbycatID';
  productbyCatID = this.base_path + 'products/productbycategoryid';
  addTofavourite = this.base_path + 'favourites/addfavourite';
  removeToFavourite = this.base_path+ 'favourites/removefavoruite';
  productByBrands = this.base_path+ 'products/productbybrandID';
  getAllfavouriteProducts = this.base_path+ 'favourites/getfavouritebyuserid';
  searchApi = this.base_path + 'search/searchproducts';
  getbrandbybrandIdAPi = this.base_path+ 'products/product-brandbyID';
  OrderSubmitCOD = this.base_path+ 'order/createorder';
  updateCustomerProfile = this.base_path+ 'users/update-customerProfile';
  getExistingCustomerDetails= this.base_path+ 'users/customer-profile';
  saveUserAddress = this.base_path+ 'useraddress/user-addresses';
  getUserAddress = this.base_path+ 'useraddress/user-addressesbyid';
  getBestSellingProducts = this.base_path+ 'products/bestsellerproducts';
  getallvendors = this.base_path+ 'users/all-vendors';
  addfavouriteVendors = this.base_path+'favourites/addfavourite';
  removefavoruiteVendors = this.base_path+'favourites/removefavoruite';
  getvendorbySearch = this.base_path+'search/itembysearch';
  getvendorProductsByVendorId = this.base_path+ 'products/getallproductsbyvendorID';



  private _storageReady = false;

  constructor(private http: HttpClient, private storage: Storage) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
    this._storageReady = true; // Ensure storage is ready
  }

  // ✅ Fetch token correctly from @ionic/storage-angular
  getAuthHeaders(): Observable<HttpHeaders> {
    if (!this._storageReady) {
      return from(this.initStorage()).pipe(
        switchMap(() => this.resolveTokenAndCreateHeaders())
      );
    }
  
    return this.resolveTokenAndCreateHeaders();
  }
  
  private resolveTokenAndCreateHeaders(): Observable<HttpHeaders> {
    return from(this.storage.get('user_loggedin')).pipe(
      switchMap((loggedIn: any) => {
        if (loggedIn === 1) {
          return from(this.storage.get('auth_token')).pipe(
            map(token => this.createHeaders(token))
          );
        } else {
          return from(this.storage.get('statictoken')).pipe(
            map(token => this.createHeaders(token))
          );
        }
      })
    );
  }
  
  private createHeaders(token: string | null): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
  

  // API Calls with Token
  get_all_categories(is_web: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { is_web: is_web };
        return this.http.post<any>(this.allcategories, body, { headers });})
    );
  }
  get_allproductsByVendorID(vendor_id: any,searchTerm: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { vendor_id: vendor_id, searchTerm:searchTerm};
        return this.http.post<any>(this.getvendorProductsByVendorId, body, { headers });})
    );
  }
  save_user_address(user_id: any,address: any,floor:any,landmark: any,type: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: user_id,address:address,floor:floor,landmark:landmark,type:type};
        return this.http.post<any>(this.saveUserAddress, body, { headers });})
    );
  }
  get_User_address(user_id: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: user_id};
        return this.http.post<any>(this.getUserAddress, body, { headers });})
    );
  }
  get_vendor_by_search(itemtype: any,title: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { searchstring: itemtype,searchtype:title};
        return this.http.post<any>(this.getvendorbySearch, body, { headers });})
    );
  }
  addToFavouriteVendors(user_id: any,vendor_id:any,favnum: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: user_id,vendor_id:vendor_id,favnum: favnum};
        return this.http.post<any>(this.addfavouriteVendors, body, { headers });})
    );
  }
  removeToFavouriteVEndors(user_id: any,vendor_id:any,favnum: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: user_id,vendor_id:vendor_id,favnum: favnum};
        return this.http.delete<any>(this.removefavoruiteVendors, {headers, body });})
    );
  }
  get_best_seller_products(user_id: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: user_id};
        return this.http.post<any>(this.getBestSellingProducts, body, { headers });})
    );
  }
  // testing(): Observable<any> {
  //   return this.http.get<any>(this.test);
  // }

  get_all_banner_imges(): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<any>(this.allBannerImages, { headers }))
    );
  }

  get_all_brands(): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<any>(this.allbrands, { headers }))
    );
  }
  get_all_vendors(user_id:any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: user_id };
        return this.http.post<any>(this.getallvendors, body, { headers });})
    );
  }

  get_all_sub_categories(is_web:any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { is_web: is_web };
        return this.http.post<any>(this.allSubcategories, body, { headers });})
    );
  }

  get_all_features_product(userID: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { userID: userID };
        return this.http.post<any>(this.allFeaturesProduct, body, { headers });})
    );
  }
  updateCustomerDetails(role_id: any,firstname: any,lastname: any,email: any,phonenumber: any,user_id: any,gender:any,dob: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { role_id:role_id,firstname:firstname,lastname:lastname,email:email,phonenumber:phonenumber,user_id: user_id,gender: gender,dob: dob };
        return this.http.put<any>(this.updateCustomerProfile, body, { headers });})
    );
  }
  insert_order_cod(userID: any, cart:any[], payment_method:any,user_address_id: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: userID, cart: cart, payment_method: payment_method,user_address_id: user_address_id };
        return this.http.post<any>(this.OrderSubmitCOD, body, { headers });})
    );
  }
  get_all_search_product(searchstring: any,user_id: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { searchstring: searchstring ,user_id:user_id };
        return this.http.post<any>(this.searchApi, body, { headers });})
    );
  }
  get_all_favourite_product(user_id: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: user_id };
        return this.http.post<any>(this.getAllfavouriteProducts, body, { headers });})
    );
  }
  get_brand_by_brand_id(brandId: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { brandId: brandId };
        return this.http.post<any>(this.getbrandbybrandIdAPi, body, { headers });})
    );
  }

  get_all_subcat_by_catID(catID: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { catID: catID };
        return this.http.post<any>(this.catByCatID, body, { headers });})
    );
  }
  get_existing_customer_details(role_id: any,user_id:any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { role_id: role_id, user_id:user_id };
        return this.http.post<any>(this.getExistingCustomerDetails, body, { headers });})
    );
  }

  add_to_favourties(user_id: any, product_id: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: user_id, product_id: product_id};
        return this.http.post<any>(this.addTofavourite, body, { headers });})
    );
  }
  remove_to_favourties(user_id: any, product_id: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { user_id: user_id, product_id: product_id };
        return this.http.delete<any>(this.removeToFavourite, {headers, body });})
    );
  }
  get_product_by_brands(userID : any, brandID: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { userID: userID, brandID: brandID};
        return this.http.post<any>(this.productByBrands, body, { headers });})
    );
  }
  // remove_to_favourties(user_id: any, product_id: any): Observable<any> {
  //   return this.getAuthHeaders().pipe(
  //     switchMap(headers => {
  //       const body = { user_id: user_id, product_id: product_id};
  //       return this.http.delete<any>(this.removeToFavourite, body, { headers });})
  //   );
  // }

  get_all_product_by_catID(catID: any,userID: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { catID: catID , userID: userID};
        return this.http.post<any>(this.productbyCatID, body, { headers });})
    );
  }
  get_all_product_by_subcatID(subcatID: any,userID: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { subcatID: subcatID , userID: userID};
        return this.http.post<any>(this.productbyCatID, body, { headers });})
    );
  }

  get_all_weekly_deals(userID: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { userID: userID };
        return this.http.post<any>(this.allWeeklyDeals, body, { headers });})
    );
  }

  get_product_details(id: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { id: id };
        return this.http.post<any>(this.productDetail, body, { headers });
      })
    );
  }

  get_category_realted_brnads(category_id: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { catID: category_id };
        return this.http.post<any>(this.categoryRelatedBrands, body, { headers });
      })
    );
  }

  get_dynamic_category(index: any, categoryset: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body = { index: index ,categoryset: categoryset };
        return this.http.post<any>(this.dynamicCategoryapi, body, { headers });
      })
    );
  }

  // get_category_two_Home_page(): Observable<any> {
  //   return this.getAuthHeaders().pipe(
  //     switchMap(headers => this.http.get<any>(this.categoryTwoHomePage, { headers }))
  //   );
  // }

  get_beauty_sub_category(): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<any>(this.beautySubCategory, { headers }))
    );
  }

  // Login API (Does not require token)
  login_with_phone(phonenumber: any, otp: any, prefix: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { phonenumber: phonenumber, otp: otp, prefix: prefix };
    return this.http.post<any>(this.loginApi, body, { headers });
  }
}
