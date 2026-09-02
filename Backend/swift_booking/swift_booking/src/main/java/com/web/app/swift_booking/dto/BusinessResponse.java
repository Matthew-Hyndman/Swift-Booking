package com.web.app.swift_booking.dto;

public record BusinessResponse(
        Integer businessId,
        String businessName,
        String description,
        String phone,
        String email
) {
}
