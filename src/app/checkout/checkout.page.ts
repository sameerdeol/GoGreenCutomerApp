import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
// import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Route, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CheckoutPage implements OnInit {
  selectedOption: string = 'option1';
  selectedDelvieryOption: string = 'today';
  selectedDate: string='';
  deliveryOption: any;
  totalamountWithDilevryCharges: any;
  selectedDateTime: string = new Date().toISOString(); 

  selectedTime: string = '';
  selectedAmPm: string = 'AM';
  addressType: any;
  fulladdress: any;
  savedUserAddress: any[] = [];
  constructor(private router: Router,private storage: Storage,private apiservice: ApiserviceService) { 
    this.init();
  }
  
  async init() {
    await this.storage.create();
  }

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.totalamountWithDilevryCharges = nav.extras.state['totalPrice'];
      this.deliveryOption = nav.extras.state['deliveryOption'];
 
    }
    // await this.storage.set('totalamountWithDilevryCharges',this.totalamountWithDilevryCharges);
    this.getCustomerAddress();
    this.addressType = await this.storage.get('selectedTypeText');
    this.fulladdress = await this.storage.get('fullAddress');
    const savedDate = await this.storage.get('selectedDate');
    const savedTime = await this.storage.get('selectedTime');

    // If both exist, combine them to set the value for the datetime picker.
    if (savedDate && savedTime) {
      this.selectedDateTime = `${savedDate}T${savedTime}`;
    } else {
      // If none exist, store the current date and time separately.
      let parts = this.selectedDateTime.split('T'); 
      await this.storage.set('selectedDate', parts[0]);
      await this.storage.set('selectedDate', parts[1]);
    }
    
   
  }

  async onDateTimeChange(event: CustomEvent) {
    const newValue = event.detail.value;  
    this.selectedDateTime = newValue;
    const [datePart, timePart] = newValue.split('T'); 

    // Save the date and time separately
    await this.storage.set('selectedDate', datePart);
    await this.storage.set('selectedTime', timePart);
  }
  async getCustomerAddress(){
    const user_id = await this.storage.get('userID');
    this.apiservice.get_User_address(user_id).subscribe((response)=>{
      if(response){
        this.savedUserAddress = response.addresses;
        console.log('get address',response)
      }
    })
  }
  navigateToViewCart() {
    // this.location.back();
    this.router.navigate(['/view-cart']);
  }
  navigateTOlocationPAge(){
    this.router.navigate(['/location']);
  }

  async selectOnlyOne(option: string, id: any) {
    if (this.selectedOption === option) {
      this.selectedOption = ''; // uncheck if clicked again
    } else {
      this.selectedOption = option; // check only this one
    }
    await this.storage.set('saveAddressID', id);
  }


  async selectOnlyOnedilvery(option: string,event: any){
    if (this.selectedDelvieryOption === option) {
      this.selectedDelvieryOption = ''; // uncheck if clicked again
    } else {
      this.selectedDelvieryOption = option; // check only this one
      console.log('Selected delivery option:', option);
      await this.storage.set('SelectedDeliveryOption', option);
      console.log('Checkbox checked:', event.target.checked);
    }
  }


  navigateTofinalCheckout(){
    // this.router.navigate(['/final-checkout']);
      this.router.navigate(['/final-checkout'], {
        state: {
          totalPrice: this.totalamountWithDilevryCharges,
        }
      });
  }
}
