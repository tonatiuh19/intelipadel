import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleCourtModalComponent } from './schedule-court-modal.component';

describe('ScheduleCourtModalComponent', () => {
  let component: ScheduleCourtModalComponent;
  let fixture: ComponentFixture<ScheduleCourtModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScheduleCourtModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleCourtModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
