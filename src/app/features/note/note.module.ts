import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteComponent } from './note.component';
import { NoteRoutingModule } from './note.routing.module';
import { CreateNoteComponent } from './create-note/create-note.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, NoteRoutingModule, SharedModule],
  declarations: [NoteComponent, NoteComponent, CreateNoteComponent],
})
export class NoteModule {}
