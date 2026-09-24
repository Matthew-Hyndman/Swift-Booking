import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { loginAsCustomerOrMemberGuard } from './login-as-customer-or-member-guard';

describe('loginAsCustomerOrMemberGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => loginAsCustomerOrMemberGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
