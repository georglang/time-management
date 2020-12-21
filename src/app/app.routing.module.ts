import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { HoursOfWorkComponent } from './features/hoursOfWork/hoursOfWork.component';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';

const routes: Routes = [
  { path: '', redirectTo: 'hours-of-work', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  {
    path: 'hours-of-work',
    loadChildren: () =>
      import('./features/hoursOfWork/hoursOfWork.module').then(
        (m) => m.HoursOfWorkModule
      ),
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
