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

  constructor(private router: Router, private fb: FormBuilder,private storage: Storage,private apiservice:ApiserviceService) {
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
    this.getCustomerAddress();
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

  async getCustomerAddress(){
    console.log('addess api run')
    const user_id =  this.UserID;
    this.apiservice.get_User_address(user_id).subscribe(async (response)=>{
      // console.log('get address',response)
    
      if(response.success === true){
        this.savedUserAddress = 1;
        this.addressOfUser = response.address;
        const addressType = response.address?.type;

        const typeText = 
          addressType === 1 ? 'Home' :
          addressType === 2 ? 'Office' :
          addressType === 3 ? 'Hotel' :
          'Other';
  
        await this.storage.set('selectedTypeText', typeText);
        console.log('get address',response)

      }else{
        this.savedUserAddress = 0;
      }
    })
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
    if(this.savedUserAddress === 1){
      this.router.navigate(['/home']);
    }else{
      this.router.navigate(['/location']);
    }
    // Add OTP validation here if needed
   
  }
 
}
