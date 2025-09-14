import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhishlistPage } from './whishlist.page';

describe('WhishlistPage', () => {
  let component: WhishlistPage;
  let fixture: ComponentFixture<WhishlistPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WhishlistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
