import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WhishlistPage } from './whishlist.page';

const routes: Routes = [
  {
    path: '',
    component: WhishlistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhishlistPageRoutingModule {}
