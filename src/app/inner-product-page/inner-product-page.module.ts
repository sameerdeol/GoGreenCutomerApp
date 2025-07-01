import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InnerProductPagePageRoutingModule } from './inner-product-page-routing.module';

import { InnerProductPagePage } from './inner-product-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InnerProductPagePageRoutingModule
  ],

})
export class InnerProductPagePageModule {}
