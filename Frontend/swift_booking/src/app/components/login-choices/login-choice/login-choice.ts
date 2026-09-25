import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth';
import { environment } from '../../../../environments/environment.local';

@Component({
  selector: 'app-login-choice',
  standalone: false,
  templateUrl: './login-choice.html',
  styleUrl: './login-choice.scss',
})
export class LoginChoice {

  constructor(private authService: AuthService) {}

  loginAsUser(): void {
    this.authService.login(`${environment.baseFrontendUrl}/home`);
  }

  registerAsUser(): void {
    this.authService.register(`${environment.baseFrontendUrl}/home`);
  }

  loginAsMember(): void {
    this.authService.login(`${environment.baseFrontendUrl}/manage-organization`);
  }

 
  registerAsMember(): void {
    this.authService.register(`${environment.baseFrontendUrl}/create-organization`);
  }

}
