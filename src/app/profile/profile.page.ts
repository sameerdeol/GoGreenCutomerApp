
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule  } from '@ionic/angular';
import { CommonModule,Location } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { ApiserviceService } from '../services/apiservice.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ProfileInitialService } from '../services/profile-initial.service';
import { CommonHeaderComponent } from "../components/common-header/common-header.component";
import { Platform } from '@ionic/angular';

register();
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
   standalone: true,
      imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent, CommonHeaderComponent], 
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfilePage implements OnInit {

@ViewChild('dateButton', { static: true }) dateButton!: ElementRef;
  phoneError: string = '';
  emailError: string = '';
  dobError: string = '';
  selectedGender: any;
  phoneNumber: any;
  genderError: any;


  firstName: any;
  lastName: any;
  email: any;
  gender: string ='';

  userId: any; // Or fetch from storage/s ession
  roleId: number = 5;
  loading: boolean = false;
  dob: string = '';

  constructor(private router: Router,
    private location: Location,
    private storage: Storage,
    private apiservice: ApiserviceService,
    private profileInitialService : ProfileInitialService,
    private alertCtrl: AlertController,
    private platform: Platform) { 
    this.init();
  }

  async ngOnInit() {
    this.userId = await this.storage.get('userID');
    this.phoneNumber =   await this.storage.get('phoneNumber');
    this.getExistingCustomerDetails();
    this.platform.backButton.subscribeWithPriority(10, async () => {
    if (!this.firstName || this.firstName.trim() === '') {
      const alert = await this.alertCtrl.create({
        header: 'Profile Incomplete',
        message: 'Please fill in your details before leaving this page.',
        buttons: ['OK']
      });
      await alert.present();
    } else {
      this.location.back();
    }
  });
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.validateForm());
    }
  }

  async init() {
    await this.storage.create();
  }
  navigateToAccount(){
    this.router.navigate(['/my-account']);
  }

  async goBack(){
    if (!this.firstName || this.firstName.trim() === '') {
    const alert = await this.alertCtrl.create({
      header: 'Profile Incomplete',
      message: 'Please fill in your details before leaving this page.',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

    this.location.back();
  }

  validateForm(): void {
    // Reset error messages
    this.emailError = '';
    this.genderError = '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    console.log('gender', this.gender)
    let isValid = true;

    if (!emailRegex.test(this.email)) {
      this.emailError = 'Email must be a valid @gmail.com address.';
      isValid = false;
    }

    if (this.gender === '') {
      this.genderError = 'Please select a gender.';
      isValid = false;
    }

    if (isValid) {
      this.SaveCustomerDetails();
    }
  }

  async SaveCustomerDetails() {
    this.loading = true;
    const role_id = this.roleId;
    const user_id = this.userId;
    const gender = this.gender;
    const firstname = this.firstName.trim();
    const lastname = this.lastName.trim();
    const email = this.email.trim();
    const phonenumber = this.phoneNumber.trim();
    const dob = this.dob.trim();

    this.apiservice.updateCustomerDetails(role_id, firstname, lastname, email, phonenumber, user_id, gender, dob)
      .subscribe(async (response) => {
        this.loading = false;
        if (response.status === true) {
          console.log('Update user API Response', response.message);

          const newInitial = this.firstName?.charAt(0).toUpperCase() || '';
          this.profileInitialService.setUserInitial(newInitial); // ✅ broadcast to other component

          // ✅ Show success alert
          const alert = await this.alertCtrl.create({
            header: 'Success',
            message: 'User details updated successfully.',
            buttons: ['OK']
          });
          await alert.present();
        }
      }, async error => {
        this.loading = false;

        // ❌ Show error alert
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Something went wrong. Please try again.',
          buttons: ['OK']
        });
        await alert.present();
      });
  }

  getExistingCustomerDetails(){
    const role_id = this.roleId;
    const user_id = this.userId;
    this.apiservice.get_existing_customer_details(role_id,user_id)
    .subscribe(async (response) => {
      if (response) {
        console.log('Existing Customer Details', response);
        const data = response.data;
        // You can show success message or navigate if needed
        this.firstName = data.firstname;
        this.lastName = data.lastname;
        this.phoneNumber = data.phonenumber;
        this.email = data.email;
        this.dob = data.dob;

        // Set gender
        this.gender = data.gender;
        const newInitial = this.firstName?.charAt(0).toUpperCase() || '';
        this.profileInitialService.setUserInitial(newInitial); // ✅ broadcast to other component
      }
    });
  }
  
  // Attach event listener on page load

}
