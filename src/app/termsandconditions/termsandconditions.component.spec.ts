import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsandconditionsComponent } from './termsandconditions.component';

describe('TermsandconditionsComponent', () => {
  let component: TermsandconditionsComponent;
  let fixture: ComponentFixture<TermsandconditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TermsandconditionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsandconditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
