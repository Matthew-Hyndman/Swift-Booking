import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private readonly authService: AuthService) {}

  canActivate(): boolean {
    if (!environment.keycloak.enabled) {
      return true;
    }

    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.authService.login(window.location.pathname);
    return false;
  }
}
