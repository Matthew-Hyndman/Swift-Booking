import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Analytics, Booking, Business, Customer, Employee } from './booking.models';
import { BookingApiService } from './services/booking-api.service';
import { AuthService } from './common/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'BookWise';
  businessId = 1;
  businesses: Business[] = [];

  customers: Customer[] = [];
  employees: Employee[] = [];
  bookings: Booking[] = [];
  loadError = '';
  submitError = '';
  analytics: Analytics = {
    totalBookings: 0,
    completedBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    bookingsByEmployee: {}
  };

  form = {
    customerId: 0,
    employeeId: 0,
    bookingDate: '',
    startTime: '',
    endTime: '',
    serviceDescription: '',
    notes: ''
  };

  constructor(
    private readonly bookingApiService: BookingApiService,
    readonly authService: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.handleAuthCallback();
      this.loadBootstrapData();
    }
  }

  submitBooking(): void {
    if (!this.form.customerId || !this.form.employeeId || !this.form.bookingDate || !this.form.startTime || !this.form.endTime) {
      this.submitError = 'Please complete all booking fields before submitting.';
      return;
    }
    this.submitError = '';

    this.bookingApiService.createBooking(this.businessId, {
      customerId: this.form.customerId,
      employeeId: this.form.employeeId,
      bookingDate: this.form.bookingDate,
      startTime: this.form.startTime,
      endTime: this.form.endTime,
      serviceDescription: this.form.serviceDescription,
      notes: this.form.notes
    }).subscribe({
      next: () => {
        this.form.serviceDescription = '';
        this.form.notes = '';
        this.form.startTime = '';
        this.form.endTime = '';
        this.loadDashboard();
      },
      error: () => {
        this.submitError = 'Unable to create appointment. Please try again.';
      }
    });
  }

  employeeStats(): Array<{ employee: string; count: number }> {
    return Object.entries(this.analytics.bookingsByEmployee)
      .map(([employee, count]) => ({ employee, count }));
  }

  login(): void {
    this.authService.login('/');
  }

  logout(): void {
    this.authService.logout();
  }

  private loadBootstrapData(): void {
    this.bookingApiService.getBusinesses().subscribe({
      next: (businesses) => {
        this.businesses = businesses;
        if (businesses.length > 0) {
          this.businessId = businesses[0].businessId;
        }
        this.loadDashboard();
      },
      error: () => {
        this.loadError = 'Unable to load businesses.';
      }
    });
  }

  private loadDashboard(): void {
    forkJoin({
      employees: this.bookingApiService.getEmployees(this.businessId),
      customers: this.bookingApiService.getCustomers(),
      bookings: this.bookingApiService.getBookings(this.businessId),
      analytics: this.bookingApiService.getAnalytics(this.businessId)
    }).subscribe({
      next: ({ employees, customers, bookings, analytics }) => {
        this.employees = employees;
        this.customers = customers;
        this.bookings = bookings;
        this.analytics = analytics;
        if (!this.form.employeeId && employees.length > 0) {
          this.form.employeeId = employees[0].employeeId;
        }
        if (!this.form.customerId && customers.length > 0) {
          this.form.customerId = customers[0].customerId;
        }
        this.loadError = '';
      },
      error: (error) => {
        const url = error?.url ?? '';
        if (url.includes('/employees')) {
          this.loadError = 'Unable to load employees.';
        } else if (url.includes('/bookings')) {
          this.loadError = 'Unable to load bookings.';
        } else if (url.includes('/customers')) {
          this.loadError = 'Unable to load customers.';
        } else if (url.includes('/analytics')) {
          this.loadError = 'Unable to load analytics.';
        } else {
          this.loadError = 'Unable to load booking data right now.';
        }
      }
    });
  }
}
