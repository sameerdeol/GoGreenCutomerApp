import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompelteProfilePage } from './compelte-profile.page';

describe('CompelteProfilePage', () => {
  let component: CompelteProfilePage;
  let fixture: ComponentFixture<CompelteProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompelteProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
