import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './services/auth';
import { NavLinks } from './common/classes/nav-links';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Swift-Booking';

  public navLinks = NavLinks.links;

  protected isLoggedIn = false;

  constructor(
    readonly authService: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((value) => {
      this.isLoggedIn = value ?? false;
    });
    if (isPlatformBrowser(this.platformId)) {
      this.toggleNavbButtons();
    }
  }

  toggleNavbButtons() {
    let authenticatedNavLinks = ['View Bookings', 'Create Booking', 'Account'];
    this.navLinks.forEach((link) => {
      if (authenticatedNavLinks.includes(link.label)) {        
        link.enabled = this.isLoggedIn;
      }
    });
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}
