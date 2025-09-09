import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { CommonModule,Location } from '@angular/common';
import { ApiserviceService } from '../services/apiservice.service';
import { CommonHeaderComponent } from '../components/common-header/common-header.component';
 
@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: true,
  imports: [IonicModule,CommonModule,CommonHeaderComponent], // ✅ Import Ionic components
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
 
  constructor(private router: Router,
    private fb: FormBuilder,
    private storage: Storage,
    private apiservice:ApiserviceService,
    private alertController: AlertController
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
  async showOtpExpiredAlert() {
    const alert = await this.alertController.create({
      header: 'OTP Expired',
      message: 'Your OTP has expired. Please resend again.',
      buttons: [
        {
          text: 'Resend',
          handler: () => {
            this.resendOtp(); // 👈 call your function here
          }
        }
      ]
    });
    await alert.present();
  }
  gobackpreviouswelcome() {
    this.router.navigate(['/welcome']);
  }
  afterotpcontinue() {
    if (this.otpExpired) {
      this.showOtpExpiredAlert();
      return;
    }
    console.log('addresvariable',this.savedUserAddress)
    if(this.is_address_saved_already == true){
      this.router.navigate(['/home']);
    }else{
      this.router.navigate(['/location']);
    }
    // Add OTP validation here if needed
   
  }
 
}