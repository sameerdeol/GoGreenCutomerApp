import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompelteProfilePageRoutingModule } from './compelte-profile-routing.module';

import { CompelteProfilePage } from './compelte-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompelteProfilePageRoutingModule
  ],
  
})
export class CompelteProfilePageModule {}
