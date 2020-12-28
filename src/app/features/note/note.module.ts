import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteComponent } from './note.component';
import { NoteRoutingModule } from './note-routing.module';

@NgModule({
  imports: [CommonModule, NoteRoutingModule],
  declarations: [NoteComponent],
})
export class NoteModule {}
