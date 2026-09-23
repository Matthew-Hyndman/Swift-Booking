import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login-choice',
  standalone: false,
  templateUrl: './login-choice.html',
  styleUrl: './login-choice.scss',
})
export class LoginChoice {

  constructor(private authService: AuthService) {}

  loginAsUser(): void {
    this.authService.setRedirectUri(`${window.location.origin}/home`);
    this.authService.login(environment.keycloak.userClientId);
  }

  loginAsMember(): void {
    this.authService.setRedirectUri(`${window.location.origin}/manage-organization`);
    this.authService.login(environment.keycloak.memberClientId);
  }

  registerAsUser(): void {
    this.authService.setRedirectUri(`${window.location.origin}/home`);
    this.authService.register(environment.keycloak.userClientId);
  }

  registerAsMember(): void {
    this.authService.setRedirectUri(`${window.location.origin}/create-organization`);
    this.authService.register(environment.keycloak.memberClientId);
  }

}
