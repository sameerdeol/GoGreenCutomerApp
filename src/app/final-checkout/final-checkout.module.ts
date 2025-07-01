import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinalCheckoutPageRoutingModule } from './final-checkout-routing.module';

import { FinalCheckoutPage } from './final-checkout.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinalCheckoutPageRoutingModule
  ],
  // declarations: [FinalCheckoutPage]
})
export class FinalCheckoutPageModule {}
