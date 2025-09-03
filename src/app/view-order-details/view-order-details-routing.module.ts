import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewOrderDetailsPage } from './view-order-details.page';

const routes: Routes = [
  {
    path: '',
    component: ViewOrderDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewOrderDetailsPageRoutingModule {}
