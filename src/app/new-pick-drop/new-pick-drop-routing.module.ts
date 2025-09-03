import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewPickDropPage } from './new-pick-drop.page';

const routes: Routes = [
  {
    path: '',
    component: NewPickDropPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewPickDropPageRoutingModule {}
