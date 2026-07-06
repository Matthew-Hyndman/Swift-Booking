package com.web.app.small_business_appointments.dto;

public record CustomerResponse(
        Integer customerId,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone
) {
}
