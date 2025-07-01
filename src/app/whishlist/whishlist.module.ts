import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WhishlistPageRoutingModule } from './whishlist-routing.module';

import { WhishlistPage } from './whishlist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WhishlistPageRoutingModule
  ],
 
})
export class WhishlistPageModule {}
