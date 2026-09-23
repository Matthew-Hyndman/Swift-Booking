import { NgModule, provideZoneChangeDetection } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
  withNoIncrementalHydration,
} from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './common/interceptors/auth.interceptor';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { PaymentComponent } from './components/payment/payment.component';
import { AccountComponent } from './components/account/account.component';
import { ViewBookingsComponent } from './components/bookings/view-bookings/view-bookings.component';
import { CreateBookingComponent } from './components/bookings/create-booking/create-booking.component';
import { BookingComponent } from './components/bookings/booking/booking.component';
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './app-routing.module';

import { environment } from '../environments/environment';

import {  
  customBearerTokenInterceptor,
  CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  provideKeycloak,
  ProvideKeycloakOptions,
} from 'keycloak-angular';
import { CreateOrganization } from './components/organization/create-organization/create-organization';
import { ManageOrganization } from './components/organization/manage-organization/manage-organization';
import { LoginChoice } from './components/login-choices/login-choice/login-choice';
import { LoginChoiceUserOnly } from './components/login-choices/login-choice-user-only/login-choice-user-only';
import { LoginChoiceMemberOnly } from './components/login-choices/login-choice-member-only/login-choice-member-only';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    SubscriptionsComponent,
    PaymentComponent,
    AccountComponent,
    ViewBookingsComponent,
    CreateBookingComponent,
    BookingComponent,
    CreateOrganization,
    ManageOrganization,
    LoginChoice,
    LoginChoiceUserOnly,
    LoginChoiceMemberOnly,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    NgbPaginationModule,
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  providers: [
    provideHttpClient( withInterceptorsFromDi()),
    provideZoneChangeDetection(),
    provideClientHydration(withEventReplay()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        {
          shouldAddToken: async (req: Request, next: any, keycloak: any) => {
            const url = req.url ?? '';
            // exclude static assets and the silent check file
            if (url.includes('/assets') || url.includes('silent-check-sso.html')) {
              return false;
            }
            return true;
          },
        },
      ],
    },
    provideKeycloak({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.userClientId,
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        pkceMethod: 'S256',
        flow: 'standard',
        enableLogging: true,
        checkLoginIframe: false,
        responseMode: 'fragment',
        //redirectUri: environment.baseFrontendUrl + '/home',
        useNonce: false,
      },
      loadUserProfileAtStartUp: false,
      bearerExcludedUrls: ['/assets', '/silent-check-sso.html'],
    } as ProvideKeycloakOptions),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}


