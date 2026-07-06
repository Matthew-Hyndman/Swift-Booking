package com.web.app.small_business_appointments.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreateBookingRequest(
        @NotNull Integer employeeId,
        @NotNull Integer customerId,
        @NotNull LocalDate bookingDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        String serviceDescription,
        String notes
) {
}
