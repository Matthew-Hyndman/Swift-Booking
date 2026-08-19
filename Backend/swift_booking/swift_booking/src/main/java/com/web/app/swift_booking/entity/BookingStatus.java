package com.web.app.swift_booking.entity;

public enum BookingStatus {
    PENDING,    // The booking has been created but not yet confirmed by the business or staff.
    CONFIRMED,  // The booking has been confirmed by the business or staff.
    COMPLETED,  // The booking has been completed.
    CANCELLED   // The booking has been cancelled.
}
