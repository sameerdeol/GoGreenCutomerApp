import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPickDropPage } from './new-pick-drop.page';

describe('NewPickDropPage', () => {
  let component: NewPickDropPage;
  let fixture: ComponentFixture<NewPickDropPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPickDropPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
