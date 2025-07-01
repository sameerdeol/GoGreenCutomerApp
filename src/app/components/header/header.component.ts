import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ApiserviceService } from 'src/app/services/apiservice.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], // Import IonicModule here
})
export class HeaderComponent  implements OnInit {
  addressType: any;
  fulladdress: any;
  customerDetails: any;
  roleId: number = 5;
  constructor(private router: Router,private storage: Storage,private apiservice:ApiserviceService) { 
    this.init();
  }
  
  async init() {
    await this.storage.create();
  }
  async ngOnInit() {
    this.addressType = await this.storage.get('selectedTypeText');
    this.fulladdress = await this.storage.get('fullAddress');
    console.log('this.addressType',this.addressType);
    this.getExistingCustomerDetails();
  }
  navigatToProfile(){
    this.router.navigate(['/profile']);
  }
  navigateToLocation(){
    this.router.navigate(['/location']);
  }
  navigateTopickdrop(){
    this.router.navigate(['/store-products']);
  }
  async getExistingCustomerDetails(){
    const role_id = this.roleId;
    const user_id = await this.storage.get('userID');;
    this.apiservice.get_existing_customer_details(role_id,user_id)
    .subscribe((response) => {
      if (response) {
        this.customerDetails = response.data;
        console.log(this.customerDetails)
        // You can show success message or navigate if needed
        // this.firstName = data.firstname;
        // this.lastName = data.lastname;
        // this.phoneNumber = data.phonenumber;
        // this.email = data.email;
        // this.dob = data.dob;

        // // Set gender
        // this.selectedGender = data.gender === 0 ? 'male' : 'female';
      }
    });
  }

}
