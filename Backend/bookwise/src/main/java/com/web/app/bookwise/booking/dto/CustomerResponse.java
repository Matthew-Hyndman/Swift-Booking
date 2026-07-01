package com.web.app.bookwise.booking.dto;

public record CustomerResponse(
        Integer customerId,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone
) {
}
