import { TestBed } from '@angular/core/testing';

import { ProfileInitialService } from './profile-initial.service';

describe('ProfileInitialService', () => {
  let service: ProfileInitialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileInitialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
