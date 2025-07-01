import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickupDropPageRoutingModule } from './pickup-drop-routing.module';

import { PickupDropPage } from './pickup-drop.page';
import { HeaderComponent } from '../components/header/header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickupDropPageRoutingModule,
    HeaderComponent, 
  ],
  
})
export class PickupDropPageModule {}
