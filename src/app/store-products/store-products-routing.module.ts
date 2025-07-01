import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreProductsPage } from './store-products.page';

const routes: Routes = [
  {
    path: '',
    component: StoreProductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreProductsPageRoutingModule {}
