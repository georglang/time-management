import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateWorkingHourComponent } from './create-working-hour.component';

describe('CreateWorkingHourComponent', () => {
  let component: CreateWorkingHourComponent;
  let fixture: ComponentFixture<CreateWorkingHourComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CreateWorkingHourComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWorkingHourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
