import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth';

import Keycloak from 'keycloak-js';

import { inject } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly keycloak = inject(Keycloak);

  constructor(private readonly authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.keycloak.token ?? null;

    if (!token) {
      return next.handle(request);
    }

    const authorizedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(authorizedRequest);
  }
}
