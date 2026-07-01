import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Analytics, Booking, Business, CreateBookingRequest, Customer, Employee } from '../booking.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingApiService {
constructor(private readonly http: HttpClient) {}

  getBusinesses() {
    return this.http.get<Business[]>(`${environment.apiBaseUrl}/businesses`);
  }

  getEmployees(businessId: number) {
    return this.http.get<Employee[]>(`${environment.apiBaseUrl}/businesses/${businessId}/employees`);
  }

  getCustomers(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<Customer[]>(`${environment.apiBaseUrl}/customers${query}`);
  }

  getBookings(businessId: number) {
    return this.http.get<Booking[]>(`${environment.apiBaseUrl}/businesses/${businessId}/bookings`);
  }

  createBooking(businessId: number, payload: CreateBookingRequest) {
    return this.http.post<Booking>(`${environment.apiBaseUrl}/businesses/${businessId}/bookings`, payload);
  }

  getAnalytics(businessId: number) {
    return this.http.get<Analytics>(`${environment.apiBaseUrl}/businesses/${businessId}/analytics`);
  }
}
