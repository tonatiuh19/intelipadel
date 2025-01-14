import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersEventTableComponent } from './users-event-table.component';

describe('UsersEventTableComponent', () => {
  let component: UsersEventTableComponent;
  let fixture: ComponentFixture<UsersEventTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersEventTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersEventTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
