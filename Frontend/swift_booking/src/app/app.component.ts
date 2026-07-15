import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './common/auth/auth.service';
import { NavLinks } from './common/classes/nav-links';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Swift-Booking';

  protected navLinks = NavLinks.links;

  constructor(
    readonly authService: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.handleAuthCallback();
    }
  }

  login(): void {
    this.authService.login(window.location.pathname || '/');
  }

  logout(): void {
    this.authService.logout();
  }
}
