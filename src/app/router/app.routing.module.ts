import { NgModule } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute, ParamMap  } from '@angular/router';
import { RecordListComponent } from '../record-list/record-list.component';
import { CreateRecordComponent } from '../create-record/create-record.component';
import { SearchComponent } from '../search/search.component';

const appRoutes = [
  { path: '', component: RecordListComponent },
  { path: 'create-record', component: CreateRecordComponent },
  { path: 'search', component: SearchComponent },
  // * wildcard if the requested URL doesn´t match any path in the URL
  // could also be a 404 page
  { path: '**', component: RecordListComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
