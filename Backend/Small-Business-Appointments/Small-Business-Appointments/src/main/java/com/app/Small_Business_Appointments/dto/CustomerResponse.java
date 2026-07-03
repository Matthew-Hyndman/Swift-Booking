package com.web.app.small-business-appointments.booking.dto;

public record CustomerResponse(
        Integer customerId,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone
) {
}
