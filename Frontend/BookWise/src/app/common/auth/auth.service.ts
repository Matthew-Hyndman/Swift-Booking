import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly TOKEN_STORAGE_KEY = 'bookwise_access_token';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  handleAuthCallback(): void {
    if (!this.isBrowser() || !environment.keycloak.enabled) {
      return;
    }

    const hash = new URLSearchParams(window.location.hash.replace('#', ''));
    const accessToken = hash.get('access_token');

    if (accessToken) {
      window.localStorage.setItem(AuthService.TOKEN_STORAGE_KEY, accessToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return window.localStorage.getItem(AuthService.TOKEN_STORAGE_KEY);
  }

  login(redirectPath: string = '/'): void {
    if (!this.isBrowser() || !environment.keycloak.enabled) {
      return;
    }

    const redirectUri = encodeURIComponent(`${window.location.origin}${redirectPath}`);
    const keycloakBase = `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect`;
    const loginUrl = `${keycloakBase}/auth?client_id=${environment.keycloak.clientId}&redirect_uri=${redirectUri}&response_type=token&scope=openid profile email`;

    window.location.assign(loginUrl);
  }

  logout(): void {
    if (!this.isBrowser()) {
      return;
    }

    window.localStorage.removeItem(AuthService.TOKEN_STORAGE_KEY);

    if (!environment.keycloak.enabled) {
      return;
    }

    const redirectUri = encodeURIComponent(window.location.origin);
    const keycloakBase = `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect`;
    const logoutUrl = `${keycloakBase}/logout?post_logout_redirect_uri=${redirectUri}&client_id=${environment.keycloak.clientId}`;
    window.location.assign(logoutUrl);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
