import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { IonLabel, IonHeader } from "@ionic/angular/standalone";

@Component({
  selector: 'app-order-product-modal',
  templateUrl: './order-product-modal.component.html',
  styleUrls: ['./order-product-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
 
})
export class OrderProductModalComponent  implements OnInit {
  @Input() products: any[] = [];

  constructor(private modalCtrl: ModalController) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  addAllToCart() {
    console.log('Adding all to cart:', this.products);
    // Add your cart logic here
    this.dismiss();
  }

}
