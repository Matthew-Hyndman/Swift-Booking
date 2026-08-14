package com.web.app.swift_booking.DTO;

import jakarta.validation.constraints.NotNull;
import com.web.app.swift_booking.entity.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record UpdateBookingRequest(
        @NotNull Integer employeeId,
        @NotNull Integer customerId,
        @NotNull LocalDate bookingDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        String serviceDescription,
        @NotNull BookingStatus status,
        String notes
) {
}