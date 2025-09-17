import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReviewPurchasePage } from './review-purchase.page';

const routes: Routes = [
  {
    path: '',
    component: ReviewPurchasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewPurchasePageRoutingModule {}
