import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreProductsPageRoutingModule } from './store-products-routing.module';

import { StoreProductsPage } from './store-products.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreProductsPageRoutingModule
  ],
  // declarations: [StoreProductsPage]
})
export class StoreProductsPageModule {}
