import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateNoteComponent } from './create-note/create-note.component';
import { NoteComponent } from './note.component';

const routes: Routes = [
  {
    path: '',
    component: NoteComponent,
    pathMatch: 'full',
  },
  {
    path: 'notes/create',
    component: CreateNoteComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoteRoutingModule {}
