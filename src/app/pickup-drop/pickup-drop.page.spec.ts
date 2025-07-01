import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickupDropPage } from './pickup-drop.page';

describe('PickupDropPage', () => {
  let component: PickupDropPage;
  let fixture: ComponentFixture<PickupDropPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PickupDropPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
