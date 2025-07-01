import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinalCheckoutPage } from './final-checkout.page';

describe('FinalCheckoutPage', () => {
  let component: FinalCheckoutPage;
  let fixture: ComponentFixture<FinalCheckoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalCheckoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
