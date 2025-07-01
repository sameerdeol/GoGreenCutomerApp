import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchedResultPage } from './searched-result.page';

describe('SearchedResultPage', () => {
  let component: SearchedResultPage;
  let fixture: ComponentFixture<SearchedResultPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchedResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
