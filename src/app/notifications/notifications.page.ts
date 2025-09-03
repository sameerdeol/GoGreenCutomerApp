
import { CommonModule,Location } from '@angular/common';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonicModule,CommonModule ], // ✅ Import Ionic components
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // ✅ Allow Web Components like <ion-icon>
})
export class NotificationsPage implements OnInit {

  constructor(private location: Location) { }

  ngOnInit() {
  }
    goback(){
    this.location.back();
  }
}
