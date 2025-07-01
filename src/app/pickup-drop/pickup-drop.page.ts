import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
register();

@Component({
  selector: 'app-pickup-drop',
  templateUrl: './pickup-drop.page.html',
  styleUrls: ['./pickup-drop.page.scss'],
    standalone: true,
    imports: [IonicModule, FormsModule, HeaderComponent, CommonModule, FooterTabsComponent], 
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PickupDropPage implements OnInit {

  categories: any;
  category_img: any;
  bannerImg: any;
  allbrands: any;
  allsubCategories: any;
  allfeaturesproducts: any;
  allweeklydeals: any;
  baseUrl = environment.baseurl;
  userID: any;
  selectedIndex: number = -1;

  constructor(private apiservice: ApiserviceService,private router: Router,private storage:Storage ) { 
    this.init();
  }
  async init() {
    await this.storage.create();
  }
  async ngOnInit() {
    const token = await this.storage.get('userID' );
    this.userID =  token.value;
    console.log('token in AppComponent:', token.value);
    this.getAllCategories();
    this.getAllBannerImg();
    this.getAllbrands();
    this.getAllSubBrands();
    this.getAllFeaturesProducts();
    this.getAllweeklyDeals();
  }
  toggleFavoritefeatured(features_product: any): void {
    features_product.isFavorite = !features_product.isFavorite;
    // Implement additional logic, such as updating a server or local storage, if necessary
  }
  selectCategory2(index: number): void {
    this.selectedIndex = index;
   
  }
  selectCategory(index: number, category_id: any, category_name: any): void {
    this.selectedIndex = index;
    this.router.navigate(['/sub-categories'], { queryParams: { id: category_id, category_name: category_name } });
  }    
  navigateToAllCat(){
    this.router.navigate(['/all-categories']);
  } 
  getAllCategories(){
    const is_web = false;
    this.apiservice.get_all_categories(is_web).subscribe((response: any) => {  
      this.categories = response.categories;
      },
    );
  }

  getAllBannerImg(){
    this.apiservice.get_all_banner_imges().subscribe((response)=>{
       this.bannerImg = response.banners;
    })
  }

  getAllbrands(){
    this.apiservice.get_all_brands().subscribe((response)=>{
      this.allbrands = response.productBrands;
    })
  }

  getAllSubBrands(){
    const is_web = false;
    this.apiservice.get_all_sub_categories(is_web).subscribe((response)=>{
      this.allsubCategories = response.subcategories;
    })
  }

  getAllFeaturesProducts(){
    const userID = 3;
    this.apiservice.get_all_features_product(userID).subscribe((response)=>{
      this.allfeaturesproducts = response.data;
    })
  }
  getAllweeklyDeals(){
    const userID = this.userID;
    this.apiservice.get_all_weekly_deals(userID).subscribe((response)=>{
      this.allweeklydeals = response.data;
      console.log(this.allweeklydeals)
    })
  }

}
