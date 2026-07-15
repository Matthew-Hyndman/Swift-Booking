import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Analytics, Booking, Business, CreateBookingRequest, Customer, Employee, UpdateBookingRequest } from '../booking.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingApiService {
  constructor(private readonly http: HttpClient) {}

  getBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${environment.apiBaseUrl}/businesses`);
  }

  getEmployees(businessId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.apiBaseUrl}/businesses/${businessId}/employees`);
  }

  getCustomers(search?: string): Observable<Customer[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<Customer[]>(`${environment.apiBaseUrl}/customers${query}`);
  }

  getBookings(businessId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiBaseUrl}/businesses/${businessId}/bookings`);
  }

  getBookingById(businessId: number, bookingId: number): Observable<Booking | undefined> {
    return this.getBookings(businessId).pipe(
      map((bookings) => bookings.find((booking) => booking.bookingId === bookingId))
    );
  }

  createBooking(businessId: number, payload: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${environment.apiBaseUrl}/businesses/${businessId}/bookings`, payload);
  }

  updateBooking(businessId: number, bookingId: number, payload: UpdateBookingRequest): Observable<Booking> {
    return this.http.put<Booking>(`${environment.apiBaseUrl}/businesses/${businessId}/bookings/${bookingId}`, payload);
  }

  getAnalytics(businessId: number): Observable<Analytics> {
    return this.http.get<Analytics>(`${environment.apiBaseUrl}/businesses/${businessId}/analytics`);
  }
}
