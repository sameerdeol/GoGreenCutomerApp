import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchedResultPage } from './searched-result.page';

const routes: Routes = [
  {
    path: '',
    component: SearchedResultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchedResultPageRoutingModule {}
