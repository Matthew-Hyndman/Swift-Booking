import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Appointment, Analytics, Employee } from './booking.models';
import { BookingApiService } from './booking-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'BookWise';
  readonly businessId = 'business-1';

  employees: Employee[] = [];
  appointments: Appointment[] = [];
  loadError = '';
  submitError = '';
  analytics: Analytics = {
    totalAppointments: 0,
    completedAppointments: 0,
    scheduledAppointments: 0,
    cancelledAppointments: 0,
    appointmentsByEmployee: {}
  };

  form = {
    customerName: '',
    serviceName: '',
    employeeId: '',
    startTime: ''
  };

  constructor(
    private readonly bookingApiService: BookingApiService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboard();
    }
  }

  submitAppointment(): void {
    if (!this.form.customerName || !this.form.serviceName || !this.form.employeeId || !this.form.startTime) {
      this.submitError = 'Please complete all booking fields before submitting.';
      return;
    }
    this.submitError = '';

    const start = new Date(this.form.startTime);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    this.bookingApiService.createAppointment(this.businessId, {
      customerName: this.form.customerName,
      serviceName: this.form.serviceName,
      employeeId: this.form.employeeId,
      startTime: start.toISOString(),
      endTime: end.toISOString()
    }).subscribe({
      next: () => {
        this.form.customerName = '';
        this.form.serviceName = '';
        this.form.startTime = '';
        this.loadDashboard();
      },
      error: () => {
        this.submitError = 'Unable to create appointment. Please try again.';
      }
    });
  }

  employeeStats(): Array<{ employee: string; count: number }> {
    return Object.entries(this.analytics.appointmentsByEmployee)
      .map(([employee, count]) => ({ employee, count }));
  }

  private loadDashboard(): void {
    this.bookingApiService.getEmployees(this.businessId).subscribe((employees) => {
      this.employees = employees;
      if (!this.form.employeeId && employees.length > 0) {
        this.form.employeeId = employees[0].id;
      }
      this.loadError = '';
    }, () => {
      this.loadError = 'Unable to load booking data right now.';
    });

    this.bookingApiService.getAppointments(this.businessId).subscribe((appointments) => {
      this.appointments = appointments;
    }, () => {
      this.loadError = 'Unable to load booking data right now.';
    });

    this.bookingApiService.getAnalytics(this.businessId).subscribe((analytics) => {
      this.analytics = analytics;
    }, () => {
      this.loadError = 'Unable to load booking data right now.';
    });
  }
}
