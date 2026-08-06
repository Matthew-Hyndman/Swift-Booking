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
  styleUrls: ['./app.component.scss', 'app.component.animations.scss'],
})
export class AppComponent implements OnInit {
  
  title = 'Swift-Booking';

  public navLinks = NavLinks.links;

  protected isLoggedIn = false;
  protected specialLinks = ['Login', 'Logout'];
  protected showHamburgerMenu = false;

  constructor(
    readonly authService: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((value) => {
      this.isLoggedIn = value ?? false;
    });
    if (isPlatformBrowser(this.platformId)) {
      this.toggleNavbLoginButtons();
    }
  }

  toggleNavbLoginButtons() {
    this.navLinks.forEach((link) => {
      if (NavLinks.authenticatedNavLinkLabels.includes(link.label)) {
        link.enabled = this.isLoggedIn;
      }
    });
  }

  toggleNavMenu() {
    let navMenu = document.querySelector('.primary-navigation') as HTMLElement;
    if (navMenu) {
      this.showHamburgerMenu = !this.showHamburgerMenu;
      navMenu.style.display = this.showHamburgerMenu ? 'flex' : 'none';
    }
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}
