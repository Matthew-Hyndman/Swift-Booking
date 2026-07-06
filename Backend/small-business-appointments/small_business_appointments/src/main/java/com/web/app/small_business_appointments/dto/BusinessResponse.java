package com.web.app.small_business_appointments.dto;

public record BusinessResponse(
        Integer businessId,
        String businessName,
        String description,
        String phone,
        String email
) {
}
