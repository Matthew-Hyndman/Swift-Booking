package com.web.app.swift_booking.DTO;

public record BusinessResponse(
        Integer businessId,
        String businessName,
        String description,
        String phone,
        String email
) {
}
