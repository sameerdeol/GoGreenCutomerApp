import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeOnePage } from './welcome-one.page';

describe('WelcomeOnePage', () => {
  let component: WelcomeOnePage;
  let fixture: ComponentFixture<WelcomeOnePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeOnePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
