import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-bottom-slide',
  templateUrl: './bottom-slide.component.html',
  styleUrls: ['./bottom-slide.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class BottomSlideComponent  implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}
  dismiss() {
    this.modalCtrl.dismiss();
  }
}
