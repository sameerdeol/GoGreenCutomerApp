import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompelteProfilePage } from './compelte-profile.page';

const routes: Routes = [
  {
    path: '',
    component: CompelteProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompelteProfilePageRoutingModule {}
