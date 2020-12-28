import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';

const routes: Routes = [
  // { path: '', redirectTo: 'hours-of-work', pathMatch: 'full' },
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/order/order.module').then((m) => m.OrderModule),
  },
  {
    path: 'hours-of-work',
    loadChildren: () =>
      import('./features/hoursOfWork/hoursOfWork.module').then(
        (m) => m.HoursOfWorkModule
      ),
  },
  {
    path: 'notes',
    loadChildren: () =>
      import('./features/note/note.module').then((m) => m.NoteModule),
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
