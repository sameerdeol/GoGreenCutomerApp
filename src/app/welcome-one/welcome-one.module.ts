import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WelcomeOnePageRoutingModule } from './welcome-one-routing.module';

import { WelcomeOnePage } from './welcome-one.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WelcomeOnePageRoutingModule
  ],
  declarations: [WelcomeOnePage]
})
export class WelcomeOnePageModule {}
