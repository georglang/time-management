import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditWorkingHourComponent } from './edit-working-hour.component';

describe('EditWorkingHourComponent', () => {
  let component: EditWorkingHourComponent;
  let fixture: ComponentFixture<EditWorkingHourComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditWorkingHourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWorkingHourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
