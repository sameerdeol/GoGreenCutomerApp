import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
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
register();
@Component({
  selector: 'app-all-categories',
  templateUrl: './all-categories.page.html',
  styleUrls: ['./all-categories.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AllCategoriesPage implements OnInit {
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
  constructor(private apiservice: ApiserviceService,private router: Router,private location : Location,private storage: Storage) { 
    this.init();
  }
  
  ngOnInit() {
    this.getAllBannerImg();
    this.getAllCategories();
    this.dynamicCategory();
  }
  async init() {
    await this.storage.create();
  }
  goback(){
    this.location.back();
  }
  onSearchChange(value: string) {
    this.searchKeyword = value;
    this.showSearchResults = !!value.trim(); // show results only when there's some input
  
    if (this.searchKeyword.trim()) {
      this.getSearchedProduct(value);
    } else {
      this.searchedProduct = [];  
      this.showSearchResults = false;
    }
  }
  async getSearchedProduct(value: any){
    const searchstring = value;
    // const searchNum = 2;
    const user_id = await this.storage.get('userID');
    this.apiservice.get_all_search_product(searchstring,user_id).subscribe((response: any) => {  
      if(response){
        this.searchedProduct = response.data;
        // this.isLoading = false;
        console.log('searchedProduct-',this.searchedProduct)
      }
     },);
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
    const is_web = false;
    this.apiservice.get_all_categories(is_web).subscribe((response: any) => {  
      if(response){
        this.categories = response.categories;
        // this.isLoading = false;
        console.log('all cat', this.categories)
      }

      },
    );
  }
  navigateToSubCAtProducts(subCatId: any, category_name: any, type: any){
    this.router.navigate(['/inner-product-page'], { queryParams: { id: subCatId, type: type ,category_name:category_name} });
  }
  dynamicCategory() {
    const categoryset = 1;
    const startingIndex = 5;
  
    // Step 1: Fetch once to get the last_added_index
    this.apiservice.get_dynamic_category(startingIndex, categoryset).subscribe((response) => {
      console.log('response 9',response);
      if (response && response.last_added_index) {
        const lastIndex = response.last_added_index;
  
        // Step 2: Loop from startingIndex to lastIndex
        for (let i = startingIndex; i <= lastIndex; i++) {
          this.apiservice.get_dynamic_category(i, categoryset).subscribe((res) => {
            if (res && res.categories && res.categories.length > 0) {
              const categoryName = res.categories[0].category_name;
  
              const items = res.categories.map((item: {
                category_name: any;
                id: any; name: any; subcategory_logo: string; }) => ({
                title: item.name,
                id: item.id,
                category_name : item.category_name,
                image: this.baseUrl + item.subcategory_logo // Replace with actual base URL
              }));
  
              this.categorySliders.push({
                title: categoryName,
                items: items
              });
  
              console.log(`Dynamic response for index ${i}:`, res);
            }
          });
        }
      }
    });
  }
}
