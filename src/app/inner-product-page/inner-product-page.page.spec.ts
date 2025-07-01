import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InnerProductPagePage } from './inner-product-page.page';

describe('InnerProductPagePage', () => {
  let component: InnerProductPagePage;
  let fixture: ComponentFixture<InnerProductPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InnerProductPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
