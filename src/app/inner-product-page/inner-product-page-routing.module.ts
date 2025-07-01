import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InnerProductPagePage } from './inner-product-page.page';

const routes: Routes = [
  {
    path: '',
    component: InnerProductPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InnerProductPagePageRoutingModule {}
