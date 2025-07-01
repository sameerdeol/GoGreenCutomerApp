import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinalCheckoutPage } from './final-checkout.page';

const routes: Routes = [
  {
    path: '',
    component: FinalCheckoutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinalCheckoutPageRoutingModule {}
