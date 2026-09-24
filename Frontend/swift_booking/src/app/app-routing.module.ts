import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginChoiceUserOnly } from './components/login-choices/login-choice-user-only/login-choice-user-only';
import { LoginChoiceMemberOnly } from './components/login-choices/login-choice-member-only/login-choice-member-only';
import { OrganizationGuard } from './common/guards/organization-guard';
import { ManageOrganization } from './components/organization/manage-organization/manage-organization';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { PaymentComponent } from './components/payment/payment.component';
import { AccountComponent } from './components/account/account.component';
import { ViewBookingsComponent } from './components/bookings/view-bookings/view-bookings.component';
import { CreateBookingComponent } from './components/bookings/create-booking/create-booking.component';
import { BookingComponent } from './components/bookings/booking/booking.component';
import { LoginAsCustomerOnlyGuard } from './common/guards/login-as-customer-only.guard';
import { CreateOrganization } from './components/organization/create-organization/create-organization';
import { LoginChoice } from './components/login-choices/login-choice/login-choice';
import { LoginAsMemberOnlyGuard } from './common/guards/login-as-member-only-guard';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'subscriptions', component: SubscriptionsComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'login-choice', component: LoginChoice },
  { path: 'login-choice-user-only', component: LoginChoiceUserOnly },
  { path: 'login-choice-member-only', component: LoginChoiceMemberOnly },
  { path: 'account', component: AccountComponent, canActivate: [LoginAsCustomerOnlyGuard] },
  { path: 'bookings', component: ViewBookingsComponent, canActivate: [LoginAsCustomerOnlyGuard] },
  { path: 'create-organization', component: CreateOrganization, canActivate: [LoginAsMemberOnlyGuard] },
  { path: 'manage-organization', component: ManageOrganization, canActivate: [LoginAsMemberOnlyGuard, OrganizationGuard] },
  { path: 'bookings/new', component: CreateBookingComponent, canActivate: [LoginAsCustomerOnlyGuard] },
  { path: 'bookings/:id', component: BookingComponent, canActivate: [LoginAsCustomerOnlyGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
