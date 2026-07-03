package com.web.app.small-business-appointments.booking.dto;

public record BusinessResponse(
        Integer businessId,
        String businessName,
        String description,
        String phone,
        String email
) {
}
