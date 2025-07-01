import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
  providers: [Storage]
})
export class SplashscreenPage implements OnInit {
 
  constructor(private router: Router,private fb: FormBuilder, private storage: Storage) { 
    this.init();
  }
  async init() {
    await this.storage.create();
  }
  async ngOnInit() {
   
    setTimeout(async () => {
      // const token1 = await Storage.get({ key: 'auth_token' });
      // const token =  await this.storage.get('auth_token');
      // console.log('token in AppComponent:', token);
      // if (token) {
      //   this.router.navigate(['/home']);
      // } else {
      //   this.router.navigate(['/splashscreen']);
      // }
      this.router.navigate(['/welcome-one']);
    }, 2000);
  }
}
