import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule ,Location } from '@angular/common';
import { register } from 'swiper/element/bundle';


import { ApiserviceService } from '../../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { FooterTabsComponent } from '../../components/footer-tabs/footer-tabs.component';
import { Storage } from '@ionic/storage-angular';
import { ChangeDetectorRef } from '@angular/core';

import { CommonHeaderComponent } from "../../components/common-header/common-header.component";
import { toggleFavourite } from '../../utils/utils';
register();


@Component({
  selector: 'app-whishlist',
  templateUrl: './whishlist.page.html',
  styleUrls: ['./whishlist.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, CommonHeaderComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WhishlistPage implements OnInit {

  constructor(private apiservice:ApiserviceService, private router: Router,private storage: Storage,private cdr: ChangeDetectorRef,private location: Location) {
    this.init();
   }


  baseUrl = environment.baseurl;
  userID: any;
  isLoading: boolean = true;

  AllProducts: any[] = [];

  async ngOnInit() {
    // const token = await Storage.get({ key: 'userID' });
    this.userID =  await this.storage.get('userID');
    this.getAllProduct();
    console.log('Wishlist PAge User ID:', this.userID );

  }
  async init() {
    await this.storage.create();
  }

  navigateToback(){
    this.location.back();
  }
  getAllProduct(){
    const user_id = this.userID;
    this.isLoading = true;
    this.apiservice.get_all_products(user_id).subscribe({
      next: (response) => {
        if(response.success == true){
          // Filter only favorite products (is_favourite = 1)
          this.AllProducts = response.products.filter((product: any) => product.is_favourite === 1);
          this.isLoading = false;
          console.log('favorite products', this.AllProducts);
        } else {
          this.AllProducts = [];
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.AllProducts = [];
        this.isLoading = false;
      }
    });
  }

  removeFromWishlist(product: any) {
    toggleFavourite(product, this.userID, this.apiservice, 'product');
    // Remove from local array immediately for better UX
    this.AllProducts = this.AllProducts.filter(p => p.id !== product.id);
  }

  navigateToProduct(product: any) {
    this.router.navigate(['/product-detail'], {
      state: { product: product, user_id: this.userID }
    });
  }

  onImageError(event: any) {
    event.target.src = 'assets/placeholder-product.jpg';
  }

}
