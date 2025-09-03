import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiserviceService } from './../services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import {jwtDecode} from 'jwt-decode';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule],
  providers: [Storage]
})
export class WelcomePage implements OnInit {
  phoneNumber: string = '';
  phoneForm: FormGroup;
  selectedCountryCode: string = '+1';
  auth_token: any;
  countryCodes: string[] = ['+1'];
  decodedToken: any;
  constructor(private fb: FormBuilder,
    private router: Router,
    private apiservice: ApiserviceService,
    private storage: Storage,) { 
    this.init();
    this.phoneForm = this.fb.group({
      countryCode: ['+1', Validators.required], 
      phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]]
    });
  }
  async init() {
    await this.storage.create();
  }
  ngOnInit() {
    // this.checkLoginStatus();
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  clearNumber() {
    this.phoneNumber = '';
  }

  redirectToOtp() {
    this.router.navigate(['/otp']);
  }

  async Login() {
    const otp = 1234;
    const phonenumber = this.phoneNumber;
    const prefix = this.selectedCountryCode;
    await this.storage.set('selectedCountryCode',this.selectedCountryCode);
    this.apiservice.login_with_phone(phonenumber, otp, prefix).subscribe(async response => {
      if (response.success === true) {
        console.log('is_new_user',response.is_new_user);
        this.auth_token = response.token;
        this.decodedToken = jwtDecode(this.auth_token );
        await this.storage.set('is_address_saved_already', response.is_user_address_available)
        console.log('Decoded Token:', this.decodedToken);
        await this.storage.set('is_new_user', response.is_new_user);
        await this.storage.set('user_loggedin', 1);
        await this.storage.set('auth_token', this.auth_token);
        await this.storage.set('userID', this.decodedToken.id);
        await this.storage.set('phoneNumber', this.phoneNumber);
        this.router.navigate(['/otp']);
      }
    });
  }

}
