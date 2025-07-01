import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreProductsPage } from './store-products.page';

describe('StoreProductsPage', () => {
  let component: StoreProductsPage;
  let fixture: ComponentFixture<StoreProductsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
