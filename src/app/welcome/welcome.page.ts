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
  selectedCountryCode: string = '+91';
  auth_token: any;
  countryCodes: string[] = ['+91', '+1', '+44', '+61', '+81', '+33'];
  decodedToken: any;
  constructor(private fb: FormBuilder, private router: Router, private apiservice: ApiserviceService,private storage: Storage) { 
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
        console.log(response);
        this.auth_token = response.token;
        this.decodedToken = jwtDecode(this.auth_token );
        console.log('Decoded Token:', this.decodedToken);
        await this.storage.set('user_loggedin', 1);
        await this.storage.set('auth_token', this.auth_token);
        await this.storage.set('userID', this.decodedToken.id);
        await this.storage.set('phoneNumber', this.phoneNumber);

        this.router.navigate(['/otp']);
      }
    });
  }

  // async checkLoginStatus() {
  //   const token = await Storage.get({ key: 'auth_token' });
  //   if (token.value) {
  //     this.router.navigate(['/home']); // Redirect to dashboard if token exists
  //   }
  // }
}
