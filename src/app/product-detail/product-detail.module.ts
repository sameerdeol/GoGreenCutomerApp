import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductDetailPageRoutingModule } from './product-detail-routing.module';

import { ProductDetailPage } from './product-detail.page';
import { HeaderComponent } from '../components/header/header.component';
import { CommonHeaderComponent } from '../components/common-header/common-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductDetailPageRoutingModule,
    HeaderComponent,
    CommonHeaderComponent
  ],

})
export class ProductDetailPageModule {}
