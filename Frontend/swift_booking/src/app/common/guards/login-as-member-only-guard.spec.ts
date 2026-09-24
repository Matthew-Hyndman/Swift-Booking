import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { loginAsMemberOnlyGuard } from './login-as-member-only-guard';

describe('loginAsMemberOnlyGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => loginAsMemberOnlyGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
