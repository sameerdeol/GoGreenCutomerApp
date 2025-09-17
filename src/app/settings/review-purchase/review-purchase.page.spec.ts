import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewPurchasePage } from './review-purchase.page';

describe('ReviewPurchasePage', () => {
  let component: ReviewPurchasePage;
  let fixture: ComponentFixture<ReviewPurchasePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewPurchasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
