import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { CommonModule,Location } from '@angular/common';
import { ApiserviceService } from '../services/apiservice.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: true,
  imports: [IonicModule,CommonModule ], // ✅ Import Ionic components
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // ✅ Allow Web Components like <ion-icon>
})
export class OtpPage implements OnInit {
  otpForm: FormGroup;
  phoneNumber: any;
  prefix: any;
  countdown: number = 60; // 60 seconds
  interval: any;
  otpExpired: boolean = false;
  UserID:any;
  savedUserAddress: any;
  addressOfUser: any[] = [];
  is_address_saved_already: any;
  is_new_user: any;

  constructor(private router: Router, 
    private fb: FormBuilder,
    private storage: Storage,
    private apiservice:ApiserviceService,
   ) {
    this.init();

    this.otpForm = this.fb.group({
      otp1: [''],
      otp2: [''],
      otp3: [''],
      otp4: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    this.phoneNumber =   await this.storage.get('phoneNumber');
    this.UserID = await this.storage.get('userID');
    this.prefix =  await this.storage.get('selectedCountryCode');
    this.is_address_saved_already = await this.storage.get('is_address_saved_already')
    this.is_new_user = await this.storage.get('is_new_user');
    // this.getCustomerAddress();
    if (this.phoneNumber && this.prefix) {
      this.startCountdown();
    }
  }
  async init() {
    await this.storage.create();
  }
  startCountdown() {
    this.countdown = 60;
    this.otpExpired = false;
  
    if (this.interval) {
      clearInterval(this.interval);
    }
  
    this.interval = setInterval(() => {
      this.countdown--;
  
      if (this.countdown <= 0) {
        clearInterval(this.interval);
        this.otpExpired = true;
      }
    }, 1000);
  }
  get formattedTime(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }
  
  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
  
  resendOtp() {
    this.startCountdown();
  }


  moveFocus(event: any, nextElementId: string | null, prevElementId: string | null) {
    if (event.inputType === "deleteContentBackward" && prevElementId) {
      // Move focus to the previous input on backspace
      const prevElement = document.getElementById(prevElementId);
      if (prevElement) {
        prevElement.focus();
      }
    } else if (event.target.value.length === 1 && nextElementId) {
      // Move focus to the next input when a number is entered
      const nextElement = document.getElementById(nextElementId);
      if (nextElement) {
        nextElement.focus();
      }
    }
  }

  gobackpreviouswelcome() {
    this.router.navigate(['/welcome']);
  }
  afterotpcontinue() {
    if (this.otpExpired) {
      return;
    }
    console.log('addresvariable',this.savedUserAddress)
    if(this.is_new_user == true){
      this.router.navigate(['/location']);
    }else{
      this.router.navigate(['/home']);
    }
    // if(this.is_address_saved_already == true){
    //   this.router.navigate(['/home']);
    // }else{
    //   this.router.navigate(['/location']);
    // }
    // Add OTP validation here if needed
   
  }
 
}
