import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewOrderDetailsPage } from './view-order-details.page';

describe('ViewOrderDetailsPage', () => {
  let component: ViewOrderDetailsPage;
  let fixture: ComponentFixture<ViewOrderDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOrderDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
