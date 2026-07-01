package com.web.app.bookwise.booking.dto;

public record BusinessResponse(
        Integer businessId,
        String businessName,
        String description,
        String phone,
        String email
) {
}
