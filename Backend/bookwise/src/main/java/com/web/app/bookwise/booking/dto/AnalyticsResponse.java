package com.web.app.bookwise.booking.dto;

import java.util.Map;

public record AnalyticsResponse(
        long totalAppointments,
        long completedAppointments,
        long scheduledAppointments,
        long cancelledAppointments,
        Map<String, Long> appointmentsByEmployee
) {
}
