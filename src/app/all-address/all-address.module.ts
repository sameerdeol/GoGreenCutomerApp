import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AllAddressPageRoutingModule } from './all-address-routing.module';

import { AllAddressPage } from './all-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AllAddressPageRoutingModule
  ],
  // declarations: [AllAddressPage]
})
export class AllAddressPageModule {}
