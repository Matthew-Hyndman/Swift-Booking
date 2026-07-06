package com.web.app.small_business_appointments.dto;

import java.util.Map;

public record AnalyticsResponse(
        long totalBookings,
        long completedBookings,
        long confirmedBookings,
        long pendingBookings,
        long cancelledBookings,
        Map<String, Long> bookingsByEmployee
) {
}
