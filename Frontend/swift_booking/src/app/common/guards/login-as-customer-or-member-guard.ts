import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../../services/auth';

@Injectable({
  providedIn: 'root'
})

export class LoginAsCustomerOrMemberGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean {
    let isLoggedIn = false;
    this.authService.isLoggedIn$.subscribe(value => {
      isLoggedIn = value ?? false;
    });

    if (isLoggedIn) {
      return true;
    }

    this.router.navigate(['/login-choice']);
    return false;
  }
}