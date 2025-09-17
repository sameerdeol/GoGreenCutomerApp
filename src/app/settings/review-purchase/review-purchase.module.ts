import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReviewPurchasePageRoutingModule } from './review-purchase-routing.module';

import { ReviewPurchasePage } from './review-purchase.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReviewPurchasePageRoutingModule
  ],
  // declarations: [ReviewPurchasePage]
})
export class ReviewPurchasePageModule {}
