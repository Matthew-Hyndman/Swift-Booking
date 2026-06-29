import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appointment, Analytics, CreateAppointmentRequest, Employee } from './booking.models';

@Injectable({
  providedIn: 'root'
})
export class BookingApiService {
  constructor(private readonly http: HttpClient) {}

  getEmployees(businessId: string) {
    return this.http.get<Employee[]>(`/api/businesses/${businessId}/employees`);
  }

  getAppointments(businessId: string) {
    return this.http.get<Appointment[]>(`/api/businesses/${businessId}/appointments`);
  }

  createAppointment(businessId: string, payload: CreateAppointmentRequest) {
    return this.http.post<Appointment>(`/api/businesses/${businessId}/appointments`, payload);
  }

  getAnalytics(businessId: string) {
    return this.http.get<Analytics>(`/api/businesses/${businessId}/analytics`);
  }
}
