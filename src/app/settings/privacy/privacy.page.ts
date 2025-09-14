import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonHeaderComponent } from 'src/app/components/common-header/common-header.component';


@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule,CommonHeaderComponent,RouterModule ], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PrivacyPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
