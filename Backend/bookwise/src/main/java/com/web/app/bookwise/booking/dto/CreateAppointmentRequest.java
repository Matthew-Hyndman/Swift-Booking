package com.web.app.bookwise.booking.dto;

import java.time.LocalDateTime;

public record CreateAppointmentRequest(
        String customerName,
        String serviceName,
        String employeeId,
        LocalDateTime startTime,
        LocalDateTime endTime
) {
}
