import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { HoursOfWorkComponent } from './features/hoursOfWork/hoursOfWork.component';

const routes: Routes = [
  {
    path: 'hours-of-work',
    loadChildren: () =>
      import('./features/hoursOfWork/hoursOfWork.module').then((m) => m.HoursOfWorkModule),
  },
  {
    path: '',
    redirectTo: 'hours-of-work',
    pathMatch: 'full',
  },

  // * wildcard if the requested URL doesn´t match any path in the URL
  // could also be a 404 page
  { path: '**', redirectTo: 'hoursOfWork', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
