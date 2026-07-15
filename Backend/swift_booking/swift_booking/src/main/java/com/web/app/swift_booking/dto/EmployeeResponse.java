package com.web.app.swift_booking.dto;

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
