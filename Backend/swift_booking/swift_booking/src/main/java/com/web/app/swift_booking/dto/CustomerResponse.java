package com.web.app.swift_booking.DTO;

public record CustomerResponse(
        Integer customerId,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone
) {
}
