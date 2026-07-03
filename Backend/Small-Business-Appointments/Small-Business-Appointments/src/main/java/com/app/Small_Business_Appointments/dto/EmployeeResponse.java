package com.web.app.small-business-appointments.booking.dto;

public record EmployeeResponse(
        Integer employeeId,
        Integer businessId,
        String firstName,
        String lastName,
        String fullName,
        String jobTitle,
        String email,
        String phone,
        Boolean isActive
) {
}
