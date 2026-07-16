import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingStatus, Business, Customer, Employee, UpdateBookingRequest } from '../../booking.models';
import { BookingApiService } from '../../services/booking-api.service';

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  readonly statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  bookingId = 0;
  selectedBusinessId: number | null = null;

  businesses: Business[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];

  form: UpdateBookingRequest = {
    customerId: 0,
    employeeId: 0,
    bookingDate: '',
    startTime: '',
    endTime: '',
    serviceDescription: '',
    status: 'PENDING',
    notes: ''
  };

  isLoading = false;
  isSaving = false;
  message = '';
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly bookingApiService: BookingApiService
  ) {}

  ngOnInit(): void {
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'));
    const queryBusinessId = Number(this.route.snapshot.queryParamMap.get('businessId'));
    this.selectedBusinessId = Number.isFinite(queryBusinessId) && queryBusinessId > 0 ? queryBusinessId : null;

    this.bookingApiService.getBusinesses().subscribe({
      next: (businesses) => {
        this.businesses = businesses;
        if (this.selectedBusinessId === null) {
          this.selectedBusinessId = businesses.length > 0 ? businesses[0].businessId : null;
        }

        if (this.selectedBusinessId !== null) {
          this.loadBooking(this.selectedBusinessId);
        }
      },
      error: () => {
        this.error = 'Unable to load businesses.';
      }
    });
  }

  onBusinessChange(): void {
    if (this.selectedBusinessId !== null) {
      this.loadBooking(this.selectedBusinessId);
    }
  }

  saveBooking(): void {
    if (this.selectedBusinessId === null || this.bookingId <= 0) {
      this.error = 'Booking context is missing.';
      return;
    }

    this.isSaving = true;
    this.message = '';
    this.error = '';

    this.bookingApiService.updateBooking(this.selectedBusinessId, this.bookingId, this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.message = 'Booking updated successfully.';
      },
      error: () => {
        this.isSaving = false;
        this.error = 'Unable to update booking. The update endpoint may not be available yet.';
      }
    });
  }

  private loadBooking(businessId: number): void {
    if (this.bookingId <= 0) {
      this.error = 'Invalid booking id.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.bookingApiService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: () => {
        this.customers = [];
      }
    });

    this.bookingApiService.getEmployees(businessId).subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: () => {
        this.employees = [];
      }
    });

    this.bookingApiService.getBookingById(businessId, this.bookingId).subscribe({
      next: (booking) => {
        this.isLoading = false;

        if (!booking) {
          this.error = 'Booking not found for the selected business.';
          return;
        }

        this.form = {
          customerId: booking.customerId,
          employeeId: booking.employeeId,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          serviceDescription: booking.serviceDescription,
          status: booking.status,
          notes: booking.notes
        };
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Unable to load booking details.';
      }
    });
  }
}
