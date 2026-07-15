package com.web.app.swift_booking.dto;

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
