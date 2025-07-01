import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchedResultPageRoutingModule } from './searched-result-routing.module';

import { SearchedResultPage } from './searched-result.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchedResultPageRoutingModule
  ],
  // declarations: [SearchedResultPage]
})
export class SearchedResultPageModule {}
