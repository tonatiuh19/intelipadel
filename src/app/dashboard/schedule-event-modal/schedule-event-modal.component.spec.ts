import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleEventModalComponent } from './schedule-event-modal.component';

describe('ScheduleEventModalComponent', () => {
  let component: ScheduleEventModalComponent;
  let fixture: ComponentFixture<ScheduleEventModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScheduleEventModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
