import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.page.html',
  styleUrls: ['./thank-you.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ThankYouPage implements OnInit {

  constructor(private router: Router) { }

 ngOnInit() {
  setTimeout(() => {
    this.router.navigate(['/home'], {
      state: { refresh: true }
    });
  }, 3000); // 3 seconds
}

}
