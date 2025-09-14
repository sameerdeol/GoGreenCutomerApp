import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonHeaderComponent } from 'src/app/components/common-header/common-header.component';


@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.page.html',
  styleUrls: ['./faqs.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule,RouterModule,CommonHeaderComponent ], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FAQsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
