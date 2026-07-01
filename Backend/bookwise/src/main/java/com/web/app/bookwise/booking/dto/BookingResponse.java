package com.web.app.bookwise.booking.dto;

import com.web.app.bookwise.booking.model.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponse(
        Integer bookingId,
        Integer businessId,
        Integer employeeId,
        String employeeName,
        Integer customerId,
        String customerName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        String serviceDescription,
        BookingStatus status,
        String notes
) {
}
