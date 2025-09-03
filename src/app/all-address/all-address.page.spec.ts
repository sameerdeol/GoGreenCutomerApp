import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllAddressPage } from './all-address.page';

describe('AllAddressPage', () => {
  let component: AllAddressPage;
  let fixture: ComponentFixture<AllAddressPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AllAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
