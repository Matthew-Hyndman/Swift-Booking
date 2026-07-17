import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Booking, BookingStatus, Business, Employee } from '../../booking.models';
import { BookingApiService } from '../../services/booking-api.service';

@Component({
  selector: 'app-view-bookings',
  standalone: false,
  templateUrl: './view-bookings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './view-bookings.component.scss'
})
export class ViewBookingsComponent implements OnInit {
  readonly statuses: Array<BookingStatus | 'ALL'> = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  businesses: Business[] = [];
  employees: Employee[] = [];
  bookings: Booking[] = [];

  selectedBusinessId: number | null = null;
  statusFilter: BookingStatus | 'ALL' = 'ALL';
  employeeFilter = 0;
  searchTerm = '';

  isLoading = false;
  error = '';

  constructor(
    private readonly bookingApiService: BookingApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadBusinesses();
  }

  loadBusinesses(): void {
    this.isLoading = true;
    this.bookingApiService.getBusinesses().subscribe({
      next: (businesses) => {
        this.businesses = businesses;
        this.selectedBusinessId = businesses.length > 0 ? businesses[0].businessId : null;
        if (this.selectedBusinessId !== null) {
          this.reloadBookings();
          return;
        }

        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load businesses.';
        this.isLoading = false;
      }
    });
  }

  reloadBookings(): void {
    if (this.selectedBusinessId === null) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.bookingApiService.getEmployees(this.selectedBusinessId).subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: () => {
        this.employees = [];
      }
    });

    this.bookingApiService.getBookings(this.selectedBusinessId).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load bookings for the selected business.';
        this.isLoading = false;
      }
    });
  }

  filteredBookings(): Booking[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.bookings.filter((booking) => {
      if (this.statusFilter !== 'ALL' && booking.status !== this.statusFilter) {
        return false;
      }

      if (this.employeeFilter > 0 && booking.employeeId !== this.employeeFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchFields = [
        booking.customerName,
        booking.employeeName,
        booking.serviceDescription,
        booking.notes,
        booking.bookingDate
      ];

      return searchFields.some((value) => value?.toLowerCase().includes(search));
    });
  }

  openBooking(bookingId: number): void {
    this.router.navigate(['/bookings', bookingId], {
      queryParams: {
        businessId: this.selectedBusinessId
      }
    });
  }
}
