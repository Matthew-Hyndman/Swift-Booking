import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login-choice-user-only',
  standalone: false,
  templateUrl: './login-choice-user-only.html',
  styleUrl: './login-choice-user-only.scss',
})
export class LoginChoiceUserOnly {
 constructor(private authService: AuthService) {}

  loginAsUser(): void {
    this.authService.login(environment.keycloak.userClientId);
  }
  
  registerAsUser(): void {
    this.authService.register(environment.keycloak.userClientId);
  }
}
