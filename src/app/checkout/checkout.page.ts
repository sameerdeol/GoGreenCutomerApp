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
  selectedAddressId: any;
  selectedAddress: any;
  minDateTime: string ='';
  maxDateTime: string = '';
  constructor(private router: Router,private storage: Storage,private apiservice: ApiserviceService) { 
    this.init();
  }
  
  async init() {
    await this.storage.create();
  }

  async ngOnInit() {
    this.setDateLimits();
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.totalamountWithDilevryCharges = nav.extras.state['totalPrice'];
      this.deliveryOption = nav.extras.state['deliveryOption'];
      console.log('this.deliveryOption ',this.deliveryOption )

    }
    await this.storage.set('isFastDeilvery',this.deliveryOption);
    this.getCustomerAddress();
    this.addressType = await this.storage.get('selectedTypeText');
    this.fulladdress = await this.storage.get('fullAddress');
    const savedDate = await this.storage.get('selectedDate');
    const savedTime = await this.storage.get('selectedTime');
    console.log('addressType', this.addressType );
    console.log('fulladdress', this.fulladdress )

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
setDateLimits() {
  const now = new Date();

  // Get local date in YYYY-MM-DDTHH:mm format
  const offset = now.getTimezoneOffset(); // in minutes
  const localISOTime = new Date(now.getTime() - (offset * 60000))
    .toISOString()
    .slice(0, 16); // cut seconds + Z

  this.minDateTime = localISOTime;

  // Max = 7 days from now
  const future = new Date();
  future.setDate(future.getDate() + 7);

  const localFutureISO = new Date(future.getTime() - (offset * 60000))
    .toISOString()
    .slice(0, 16);

  this.maxDateTime = localFutureISO;
}


  async onDateTimeChange(event: CustomEvent) {
    const newValue = event.detail.value;  
    this.selectedDateTime = newValue;
    console.log('newValue',newValue)
    const [datePart, timePart] = newValue.split('T'); 
    await this.storage.set('sheduledDateAndTime', newValue);
    // Save the date and time separately
    await this.storage.set('selectedDate', datePart);
    await this.storage.set('selectedTime', timePart);
  }
async getCustomerAddress() {
  const user_id = await this.storage.get('userID');
  this.apiservice.get_User_address(user_id).subscribe(async (response) => {
    if (response) {
      this.savedUserAddress = response.addresses;
      console.log('get address', response);

      // ✅ Try to find default address
      let defaultAddress = this.savedUserAddress.find(address => address.last_used === 1);

      // ✅ If no default, use the first one
      if (!defaultAddress && this.savedUserAddress.length > 0) {
        defaultAddress = this.savedUserAddress[0];
      }

      if (defaultAddress) {
        const defaultIndex = this.savedUserAddress.indexOf(defaultAddress);
        this.selectedOption = 'option' + defaultIndex;
        this.selectedAddressId = defaultAddress.id;
        this.selectedAddress = defaultAddress;

        // Store in storage
        await this.storage.set('saveAddressID', defaultAddress.id);
        await this.storage.set('selectedAddress', defaultAddress);

        console.log('Selected address set:', defaultAddress);
      }
    }
  });
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
      this.selectedAddressId = null;
      this.selectedAddress = null;
      await this.storage.remove('saveAddressID');
      await this.storage.remove('selectedAddress');
    } else {
      this.selectedOption = option; // check only this one
      this.selectedAddressId = id;
      
      // Find and store the selected address details
      this.selectedAddress = this.savedUserAddress.find(address => address.id === id);
      await this.storage.set('saveAddressID', id);
      await this.storage.set('selectedAddress', this.selectedAddress);
    }
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
