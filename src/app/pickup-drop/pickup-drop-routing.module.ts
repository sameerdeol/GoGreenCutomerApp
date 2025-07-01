import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickupDropPage } from './pickup-drop.page';

const routes: Routes = [
  {
    path: '',
    component: PickupDropPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickupDropPageRoutingModule {}
