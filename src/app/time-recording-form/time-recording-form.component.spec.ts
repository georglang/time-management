import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeRecordingFormComponent } from './time-recording-form.component';

describe('TimeRecordingFormComponent', () => {
  let component: TimeRecordingFormComponent;
  let fixture: ComponentFixture<TimeRecordingFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeRecordingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeRecordingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
