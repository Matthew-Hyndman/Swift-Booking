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
    this.authService.login(environment.keycloak.memberClientId);
  }


  registerAsMember(): void {
    this.authService.register(environment.keycloak.memberClientId);
  }

}
