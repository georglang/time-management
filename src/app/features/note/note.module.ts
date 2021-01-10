import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteComponent } from './note.component';
import { NoteRoutingModule } from './note-routing.module';
import { CreateNoteComponent } from './create-note/create-note.component';
import { NotesListComponent } from './notes-list/notes-list.component';

@NgModule({
  imports: [CommonModule, NoteRoutingModule],
  declarations: [NoteComponent, NotesListComponent, CreateNoteComponent],
})
export class NoteModule {}
