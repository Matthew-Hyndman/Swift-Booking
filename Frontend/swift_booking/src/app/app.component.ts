import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  HostListener,
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
  protected specialLinks = ['Login', 'Logout'];
  protected showHamburgerMenu = true;
  protected isMobile = false;

  constructor(
    readonly authService: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((value) => {
      this.isLoggedIn = value ?? false;
    });
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 960;
      this.showHamburgerMenu = !this.isMobile;
      this.toggleNavbLoginButtons();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const isMobile = window.innerWidth <= 640;
    if (isMobile !== this.isMobile) {
      this.isMobile = isMobile;
      this.showHamburgerMenu = !isMobile;
    }
  }

  @HostListener('document:mousewheel')
  onDocumentMousewheelEvent(): void {
    if (this.showHamburgerMenu && this.isMobile) {
      this.toggleNavMenu();
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
    if (this.isMobile) {
      this.showHamburgerMenu = !this.showHamburgerMenu;
    }
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}
