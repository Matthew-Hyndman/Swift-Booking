import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

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

    this.router.navigate(['/login-choice-user-only']);
    return false;
  }
}
