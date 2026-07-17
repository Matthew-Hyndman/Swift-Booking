import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Business, Customer, Employee } from '../../booking.models';
import { BookingApiService } from '../../services/booking-api.service';

@Component({
  selector: 'app-create-booking',
  standalone: false,
  templateUrl: './create-booking.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './create-booking.component.scss'
})
export class CreateBookingComponent implements OnInit {
  businesses: Business[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];

  selectedBusinessId: number | null = null;

  form = {
    customerId: 0,
    employeeId: 0,
    bookingDate: '',
    startTime: '',
    endTime: '',
    serviceDescription: '',
    notes: ''
  };

  error = '';
  success = '';
  isSubmitting = false;

  constructor(
    private readonly bookingApiService: BookingApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.bookingApiService.getBusinesses().subscribe({
      next: (businesses) => {
        this.businesses = businesses;
        this.selectedBusinessId = businesses.length > 0 ? businesses[0].businessId : null;

        if (this.selectedBusinessId !== null) {
          this.loadPeopleData(this.selectedBusinessId);
        }
      },
      error: () => {
        this.error = 'Unable to load businesses.';
      }
    });
  }

  onBusinessChange(): void {
    if (this.selectedBusinessId === null) {
      return;
    }

    this.loadPeopleData(this.selectedBusinessId);
  }

  submitBooking(): void {
    if (this.selectedBusinessId === null) {
      this.error = 'Select a business before creating a booking.';
      return;
    }

    if (!this.form.customerId || !this.form.employeeId || !this.form.bookingDate || !this.form.startTime || !this.form.endTime) {
      this.error = 'Please complete all required booking fields.';
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.success = '';

    this.bookingApiService.createBooking(this.selectedBusinessId, {
      customerId: this.form.customerId,
      employeeId: this.form.employeeId,
      bookingDate: this.form.bookingDate,
      startTime: this.form.startTime,
      endTime: this.form.endTime,
      serviceDescription: this.form.serviceDescription,
      notes: this.form.notes
    }).subscribe({
      next: (createdBooking) => {
        this.isSubmitting = false;
        this.success = 'Booking created successfully.';
        this.router.navigate(['/bookings', createdBooking.bookingId], {
          queryParams: { businessId: this.selectedBusinessId }
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.error = 'Unable to create booking right now.';
      }
    });
  }

  private loadPeopleData(businessId: number): void {
    this.error = '';

    this.bookingApiService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.form.customerId = customers.length > 0 ? customers[0].customerId : 0;
      },
      error: () => {
        this.customers = [];
      }
    });

    this.bookingApiService.getEmployees(businessId).subscribe({
      next: (employees) => {
        this.employees = employees;
        this.form.employeeId = employees.length > 0 ? employees[0].employeeId : 0;
      },
      error: () => {
        this.employees = [];
      }
    });
  }
}
