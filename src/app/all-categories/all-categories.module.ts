import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AllCategoriesPageRoutingModule } from './all-categories-routing.module';

import { AllCategoriesPage } from './all-categories.page';
import { CommonHeaderComponent } from '../components/common-header/common-header.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AllCategoriesPageRoutingModule,
    CommonHeaderComponent
  ],
  
  // declarations: [AllCategoriesPage]
})
export class AllCategoriesPageModule {}
