
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule ,ToastController } from '@ionic/angular';
// import { HeaderComponent } from '../components/header/header.component';
import { CommonModule,Location } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
register();
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
   standalone: true,
      imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent], 
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfilePage implements OnInit {
  phoneError: string = '';
  emailError: string = '';
  dobError: string = '';
  selectedGender: any;
  phoneNumber: any;
  genderError: any;
  genderValue:any;

  firstName: any;
  lastName: any;
  email: any;
  dob: any;

  userId: any; // Or fetch from storage/session
  roleId: number = 5;
  loading: boolean = false;
  constructor(private router: Router,private location: Location,private storage: Storage,private apiservice: ApiserviceService,private toastController: ToastController ) { 
    this.init();
  }

  async ngOnInit() {
    this.userId = await this.storage.get('userID');
    this.phoneNumber =   await this.storage.get('phoneNumber');
    this.getExistingCustomerDetails();
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
  goBack(){
    this.location.back();
  }
  selectGender(gender: 'male' | 'female') {
    this.selectedGender = gender;
    this.genderValue = gender === 'male' ? 0 : 1;
    console.log('Selected Gender Value:', this.genderValue);
  }
  validateForm(): void {
    // this.phoneError = '';
    this.emailError = '';
    this.dobError = '';
    this.genderError = '';
  
    // const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  
    // if (!phoneRegex.test(this.phoneNumber)) {
    //   this.phoneError = 'Phone number must be exactly 10 digits.';
    // }
  
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Email must be a valid @gmail.com address.';
    }
  
    if (!dobRegex.test(this.dob)) {
      this.dobError = 'Date of Birth must be in dd/mm/yyyy format.';
    }
  
    if (!this.selectedGender) {
      this.genderError = 'Please select a gender.';
    }
  
    const isValid = !this.phoneError && !this.emailError && !this.dobError && !this.genderError;
  
    if (isValid) {
      this.SaveCustomerDetails();
    }
  }
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    toast.present();
  }
  SaveCustomerDetails() {
    this.loading = true;

    const role_id = this.roleId;
    const user_id = this.userId;
    const gender = this.genderValue;
    const firstname = this.firstName.trim();
    const lastname = this.lastName.trim();
    const email = this.email.trim();
    const phonenumber = this.phoneNumber.trim();
    const dob = this.dob.trim();

    this.apiservice.updateCustomerDetails(role_id, firstname, lastname, email, phonenumber, user_id, gender, dob)
      .subscribe((response) => {
        this.loading = false;
        if (response) {
          console.log('Update user API Response', response);
          this.showToast('User details updated successfully');
        }
      }, error => {
        this.loading = false;
        this.showToast('Something went wrong. Please try again.');
      });
  }

  getExistingCustomerDetails(){
    const role_id = this.roleId;
    const user_id = this.userId;
    this.apiservice.get_existing_customer_details(role_id,user_id)
    .subscribe((response) => {
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
        this.selectedGender = data.gender === 0 ? 'male' : 'female';
      }
    });
  }
  
  // Attach event listener on page load

}
