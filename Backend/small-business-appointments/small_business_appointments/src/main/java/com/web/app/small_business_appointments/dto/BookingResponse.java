package com.web.app.small_business_appointments.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.web.app.small_business_appointments.entity.BookingStatus;

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
