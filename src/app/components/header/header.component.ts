import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { ProfileInitialService } from 'src/app/services/profile-initial.service';
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
  userInitial: string = '';
  firstName: any;
  constructor(private router: Router,
    private storage: Storage,
    private apiservice:ApiserviceService,
    private profileInitialService: ProfileInitialService) { 
    this.init();
  }
  
  async init() {
    await this.storage.create();
  }
  async ngOnInit() {
    // this.addressType = await this.storage.get('selectedTypeText');
    this.fulladdress = await this.storage.get('fullAddress');
    this.profileInitialService.userInitial$.subscribe(initial => {
    this.userInitial = initial;
  });
    // console.log('this.addressType',this.addressType); 
    this.getExistingCustomerDetails();
  }
  navigatToProfile(){
    this.router.navigate(['/profile']);
  }
  navigateToLocation(){
    this.router.navigate(['/location']);
  }
  navigateTopickdrop(){
    this.router.navigate(['/new-pick-drop']);
  }
  async getExistingCustomerDetails(){
    const role_id = this.roleId;
    const user_id = await this.storage.get('userID');;
    this.apiservice.get_existing_customer_details(role_id,user_id)
    .subscribe((response) => {
      if (response) {
        this.customerDetails = response.data;
        this.firstName = response.data.firstname;
        const newInitial = this.firstName?.charAt(0).toUpperCase() || '';
        this.profileInitialService.setUserInitial(newInitial);  
        // console.log('address type',this.customerDetails.type)   
        if(this.customerDetails.type == 1){
            this.addressType = 'Home'
        } else if(this.customerDetails.type == 2){
            this.addressType = 'Office'
        } else if(this.customerDetails.type == 3){
            this.addressType = 'Hotel'
        }
        else if(this.customerDetails.type == 4){
            this.addressType = 'Other'
        }
      }
    });
  }
  navigateToNotifications(){
   
      this.router.navigate(['/notifications']);
   
  }

}
