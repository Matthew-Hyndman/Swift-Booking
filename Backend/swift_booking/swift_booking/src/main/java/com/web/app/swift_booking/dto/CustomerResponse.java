package com.web.app.swift_booking.dto;

public record CustomerResponse(
        Integer customerId,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone
) {
}
