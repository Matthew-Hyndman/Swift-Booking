export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Organization {
  organizationId: number;
  organizationName: string;
  description: string;
  phone: string;
  email: string;
}

export interface Employee {
  employeeId: number;
  organizationId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Booking {
  bookingId: number;
  organizationId: number;
  employeeId: number;
  employeeName: string;
  customerId: number;
  customerName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  serviceDescription: string;
  status: BookingStatus;
  notes: string;
}

export interface Analytics {
  totalBookings: number;
  completedBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  bookingsByEmployee: Record<string, number>;
}

export interface CreateBookingRequest {
  employeeId: number;
  customerId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  serviceDescription: string;
  notes: string;
}

export interface UpdateBookingRequest {
  employeeId: number;
  customerId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  serviceDescription: string;
  status: BookingStatus;
  notes: string;
}
