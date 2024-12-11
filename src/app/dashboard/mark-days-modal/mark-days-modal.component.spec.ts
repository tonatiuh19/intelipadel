import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkDaysModalComponent } from './mark-days-modal.component';

describe('MarkDaysModalComponent', () => {
  let component: MarkDaysModalComponent;
  let fixture: ComponentFixture<MarkDaysModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkDaysModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkDaysModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
