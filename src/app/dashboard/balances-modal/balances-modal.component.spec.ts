import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancesModalComponent } from './balances-modal.component';

describe('BalancesModalComponent', () => {
  let component: BalancesModalComponent;
  let fixture: ComponentFixture<BalancesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BalancesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalancesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
