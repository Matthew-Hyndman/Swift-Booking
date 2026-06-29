package com.web.app.bookwise.booking.model;

import java.time.LocalDateTime;

public record Appointment(
        Long id,
        String businessId,
        String customerName,
        String serviceName,
        String employeeId,
        String employeeName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        AppointmentStatus status
) {
}
