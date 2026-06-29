package com.web.app.bookwise.booking.service;

import com.web.app.bookwise.booking.dto.AnalyticsResponse;
import com.web.app.bookwise.booking.dto.CreateAppointmentRequest;
import com.web.app.bookwise.booking.model.Appointment;
import com.web.app.bookwise.booking.model.AppointmentStatus;
import com.web.app.bookwise.booking.model.Employee;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final AtomicLong idGenerator = new AtomicLong(0);
    private final List<Appointment> appointments = new CopyOnWriteArrayList<>();
    private final List<Employee> defaultEmployees = List.of(
            new Employee("emp-1", "Alex Jordan"),
            new Employee("emp-2", "Sam Rivera"),
            new Employee("emp-3", "Jamie Morgan")
    );

    public List<Employee> getEmployees() {
        return defaultEmployees;
    }

    public List<Appointment> getAppointmentsByBusiness(String businessId) {
        return appointments.stream()
                .filter(appointment -> appointment.businessId().equals(businessId))
                .sorted(Comparator.comparing(Appointment::startTime))
                .toList();
    }

    public Appointment createAppointment(String businessId, CreateAppointmentRequest request) {
        Employee employee = defaultEmployees.stream()
                .filter(e -> e.id().equals(request.employeeId()))
                .findFirst()
                .orElse(defaultEmployees.get(0));

        Appointment appointment = new Appointment(
                idGenerator.incrementAndGet(),
                businessId,
                normalize(request.customerName()),
                normalize(request.serviceName()),
                employee.id(),
                employee.name(),
                fallback(request.startTime()),
                fallbackEnd(request.startTime(), request.endTime()),
                AppointmentStatus.SCHEDULED
        );

        appointments.add(appointment);
        return appointment;
    }

    public AnalyticsResponse getAnalytics(String businessId) {
        List<Appointment> businessAppointments = getAppointmentsByBusiness(businessId);

        long completed = businessAppointments.stream().filter(a -> a.status() == AppointmentStatus.COMPLETED).count();
        long scheduled = businessAppointments.stream().filter(a -> a.status() == AppointmentStatus.SCHEDULED).count();
        long cancelled = businessAppointments.stream().filter(a -> a.status() == AppointmentStatus.CANCELLED).count();

        Map<String, Long> byEmployee = businessAppointments.stream()
                .collect(Collectors.groupingBy(Appointment::employeeName, Collectors.counting()));

        return new AnalyticsResponse(
                businessAppointments.size(),
                completed,
                scheduled,
                cancelled,
                byEmployee
        );
    }

    private String normalize(String value) {
        if (Objects.isNull(value) || value.isBlank()) {
            return "Unknown";
        }
        return value.trim();
    }

    private LocalDateTime fallback(LocalDateTime value) {
        return value == null ? LocalDateTime.now().plusDays(1) : value;
    }

    private LocalDateTime fallbackEnd(LocalDateTime start, LocalDateTime end) {
        if (end != null) {
            return end;
        }
        LocalDateTime startTime = fallback(start);
        return startTime.plusMinutes(30);
    }
}
