import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth';

@Injectable({
  providedIn: 'root',
})
export class LoginAsCustomerOnlyGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await firstValueFrom(this.authService.isLoggedIn$);

    if (isLoggedIn) {
      return true;
    }

    await this.router.navigate(['/login-choice-user-only']);
    return false;
  }
}
