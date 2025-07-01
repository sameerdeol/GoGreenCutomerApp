import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
// import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';

import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { ApiserviceService } from '../services/apiservice.service';
import { Route, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-final-checkout',
  templateUrl: './final-checkout.page.html',
  styleUrls: ['./final-checkout.page.scss'],
    standalone: true,
    imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FinalCheckoutPage implements OnInit {
  selectedOption: string = 'option1';
  selectedDelvieryOption: string = 'today';
  selectedDate: string='';
  deliveryOption: any;
  totalamountWithDilevryCharges: any;
  verb: any;


  selectedTime: any;
  selectedAmPm: any;
  userID: any;
  cartitems: any[]=[];
  loading: boolean = false;
  constructor(private router: Router,private storage: Storage,private apiservice: ApiserviceService) { 
    this.init();
  }
  async init() {
    await this.storage.create();
  }
  async ngOnInit() {
    const user_id = await this.storage.get('userID');
    this.userID =  user_id;
    this.cartitems =  await this.storage.get('cartItems');
    
    if (this.cartitems && Array.isArray(this.cartitems)) {
      this.cartitems = this.cartitems.map(item => {
        const { id, ...rest } = item;
        return {
          ...rest,
          product_id: id
        };
      });

      console.log('Updated cartitems:', this.cartitems);
    }
    console.log('cartitems-',this.cartitems );
    const selectedOption = await this.storage.get('SelectedDeliveryOption');
    if(selectedOption === 'nottoday'){
      this.selectedDate = await this.storage.get('selectedDate');
      this.selectedTime = await this.storage.get('selectedTime');
      this.verb = 'at';
    } else{
      this.selectedDate = 'Arrivin Today';
      this.selectedTime = '20 mins';
      this.verb = 'in';
    }



    this.deliveryOption = await this.storage.get('selectedDeliveryOption');
    this.totalamountWithDilevryCharges = await this.storage.get('totalAmountWithDeleveryCharges');
  
  }

  navigateTocheckout() {
    // this.location.back();
    this.router.navigate(['/checkout']);
  }
  async navigateTothankyoupage() {
    this.loading = true; // Show loader
  
    const userID = this.userID;
    const cart = this.cartitems;
    const payment_method = 'COD';
    const user_address_id = await this.storage.get('saveAddressID');
  
    this.apiservice.insert_order_cod(userID, cart, payment_method, user_address_id).subscribe(
      (response) => {
        this.loading = false; // Hide loader when done
  
        if (response.order_id) {
          this.router.navigate(['/thank-you']);
          this.storage.remove('cartItems');
          console.log('response-', response);
        } else {
          // Optionally handle error
        }
      },
      (error) => {
        this.loading = false; // Hide loader on error
        console.error('API Error:', error);
      }
    );
  }

}
