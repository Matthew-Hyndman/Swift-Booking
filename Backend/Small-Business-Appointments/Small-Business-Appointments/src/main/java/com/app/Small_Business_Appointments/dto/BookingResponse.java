package com.web.app.small-business-appointments.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.web.app.small-business-appointments.booking.entity.BookingStatus;

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
