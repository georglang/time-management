/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WorkingHourListComponent } from './working-hour-list.component';

describe('WorkingHourListComponent', () => {
  let component: WorkingHourListComponent;
  let fixture: ComponentFixture<WorkingHourListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkingHourListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingHourListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
