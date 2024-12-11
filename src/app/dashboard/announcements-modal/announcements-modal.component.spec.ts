import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementsModalComponent } from './announcements-modal.component';

describe('AnnouncementsModalComponent', () => {
  let component: AnnouncementsModalComponent;
  let fixture: ComponentFixture<AnnouncementsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnouncementsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
