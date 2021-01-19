import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';

const routes: Routes = [
  // { path: '', redirectTo: 'working-hours', pathMatch: 'full' },
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/order/order.module').then((m) => m.OrderModule),
  },

  // * wildcard if the requested URL doesn´t match any path in the URL
  // could also be a 404 page
  { path: '**', redirectTo: 'working-hours', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
