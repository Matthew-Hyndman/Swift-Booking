import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login-choice-member-only',
  standalone: false,
  templateUrl: './login-choice-member-only.html',
  styleUrl: './login-choice-member-only.scss',
})
export class LoginChoiceMemberOnly {

   constructor(private authService: AuthService) {}


  loginAsMember(): void {
    this.authService.setRedirectUri(`${window.location.origin}/manage-organization`);
    this.authService.login(environment.keycloak.memberClientId);
  }


  registerAsMember(): void {
    this.authService.setRedirectUri(`${window.location.origin}/create-organization`);
    this.authService.register(environment.keycloak.memberClientId);
  }

}
