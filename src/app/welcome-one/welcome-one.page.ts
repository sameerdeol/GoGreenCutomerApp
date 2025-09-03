import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiserviceService } from '../services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import {jwtDecode} from 'jwt-decode';
@Component({
  selector: 'app-welcome-one',
  templateUrl: './welcome-one.page.html',
  styleUrls: ['./welcome-one.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class WelcomeOnePage implements OnInit {
  allfeaturesproducts: any;
  test: any;
  token: any;
  decodedstaticToken:any;
  constructor(private router: Router,private fb: FormBuilder, private apiservice: ApiserviceService,private storage: Storage) { 
    this.init();
  }
  async init() {
    await this.storage.create();
  }
  ngOnInit(): void {
    this.token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODQsInJvbGVfaWQiOjUsInVzZXJuYW1lIjpudWxsLCJpYXQiOjE3NDM5OTkxODh9.A2WM2h_NsEhrI3hqhJaRZNmb8iO7lVObN0w11kt2lJM';
    console.log('decode static token',this.token)
  }

  navigateToWelcome(){
    this.router.navigate(['/welcome']);
  }
  async navigateToHome(){
    this.router.navigate(['/home']);
    await this.storage.set('statictoken', this.token);
  }
}

