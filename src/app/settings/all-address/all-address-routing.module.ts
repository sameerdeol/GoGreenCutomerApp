import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllAddressPage } from './all-address.page';

const routes: Routes = [
  {
    path: '',
    component: AllAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllAddressPageRoutingModule {}
