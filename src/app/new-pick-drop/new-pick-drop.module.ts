import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPickDropPageRoutingModule } from './new-pick-drop-routing.module';

import { NewPickDropPage } from './new-pick-drop.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewPickDropPageRoutingModule,
    NewPickDropPage
  ]
})
export class NewPickDropPageModule {}
