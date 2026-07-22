import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private readonly authService: AuthService) {}

  canActivate(): boolean {
    let isLoggedIn = false;
    this.authService.isLoggedIn$.subscribe(value => {
      isLoggedIn = value ?? false;
    });

    if (isLoggedIn) {
      return true;
    }

    this.authService.login();
    return false;
  }
}
