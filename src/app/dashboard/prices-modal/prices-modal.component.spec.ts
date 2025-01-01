import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricesModalComponent } from './prices-modal.component';

describe('PricesModalComponent', () => {
  let component: PricesModalComponent;
  let fixture: ComponentFixture<PricesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PricesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
