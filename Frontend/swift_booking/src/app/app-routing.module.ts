import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { PaymentComponent } from './components/payment/payment.component';
import { AccountComponent } from './components/account/account.component';
import { ViewBookingsComponent } from './components/view-bookings/view-bookings.component';
import { CreateBookingComponent } from './components/create-booking/create-booking.component';
import { BookingComponent } from './components/booking/booking.component';
import { AuthGuard } from './common/guards/auth.guard';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'subscriptions', component: SubscriptionsComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'bookings', component: ViewBookingsComponent, canActivate: [AuthGuard] },
  { path: 'bookings/new', component: CreateBookingComponent, canActivate: [AuthGuard] },
  { path: 'bookings/:id', component: BookingComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
