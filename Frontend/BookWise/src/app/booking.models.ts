export interface Employee {
  id: string;
  name: string;
}

export interface Appointment {
  id: number;
  businessId: string;
  customerName: string;
  serviceName: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface Analytics {
  totalAppointments: number;
  completedAppointments: number;
  scheduledAppointments: number;
  cancelledAppointments: number;
  appointmentsByEmployee: Record<string, number>;
}

export interface CreateAppointmentRequest {
  customerName: string;
  serviceName: string;
  employeeId: string;
  startTime: string;
  endTime: string;
}
