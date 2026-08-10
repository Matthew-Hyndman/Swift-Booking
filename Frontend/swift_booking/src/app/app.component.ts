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
import { LinkObj } from './common/classes/link-obj';
import { Router } from '@angular/router';

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
  protected isMobileOrTablet = false;

  constructor(
    private router: Router,
    readonly authService: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((value) => {
      this.isLoggedIn = value ?? false;
    });
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileOrTablet = window.innerWidth <= 960;
      this.showHamburgerMenu = !this.isMobileOrTablet;
      this.toggleNavbLoginButtons();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const isMobileOrTablet = window.innerWidth <= 960;
    if (isMobileOrTablet !== this.isMobileOrTablet) {
      this.isMobileOrTablet = isMobileOrTablet;
      this.showHamburgerMenu = !isMobileOrTablet;
    }
  }

  @HostListener('document:mousewheel')
  onDocumentMousewheelEvent(): void {
    if (this.showHamburgerMenu && this.isMobileOrTablet) {
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
    if (this.isMobileOrTablet) {
      this.showHamburgerMenu = !this.showHamburgerMenu;
    }
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  setNavLinkFunctionality(link: LinkObj) {

    switch (link.label) {
      /*
        for links that should have addional functionality, 
        add cases here
      */
      default:
        this.router.navigate([link.path]);
        break;
    }

    this.toggleNavMenu();
  }
}
