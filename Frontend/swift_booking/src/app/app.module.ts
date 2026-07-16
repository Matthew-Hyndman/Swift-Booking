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
  HttpClientModule,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './common/interceptors/auth.interceptor';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { PaymentComponent } from './components/payment/payment.component';
import { AccountComponent } from './components/account/account.component';
import { ViewBookingsComponent } from './components/view-bookings/view-bookings.component';
import { CreateBookingComponent } from './components/create-booking/create-booking.component';
import { BookingComponent } from './components/booking/booking.component';
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './app-routing.module';

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
    provideHttpClient(withFetch()),
    provideZoneChangeDetection(),
    //withNoIncrementalHydration(),
    /*provideClientHydration(withEventReplay()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }*/
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}


