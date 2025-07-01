import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubCategoriesPage } from './sub-categories.page';

describe('SubCategoriesPage', () => {
  let component: SubCategoriesPage;
  let fixture: ComponentFixture<SubCategoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubCategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
