package com.web.app.swift_booking.controller;

import jakarta.validation.Valid;
import com.web.app.swift_booking.dto.AnalyticsResponse;
import com.web.app.swift_booking.dto.BookingResponse;
import com.web.app.swift_booking.dto.BusinessResponse;
import com.web.app.swift_booking.dto.CreateBookingRequest;
import com.web.app.swift_booking.dto.CustomerResponse;
import com.web.app.swift_booking.dto.EmployeeResponse;
import com.web.app.swift_booking.dto.UpdateBookingRequest;
import com.web.app.swift_booking.service.BookingService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/businesses")
    public List<BusinessResponse> getBusinesses() {
        return bookingService.getBusinesses();
    }

    @GetMapping("/businesses/{businessId}/employees")
    public List<EmployeeResponse> getEmployees(@PathVariable Integer businessId) {
        return bookingService.getEmployees(businessId);
    }

    @GetMapping("/customers")
    public List<CustomerResponse> getCustomers(@RequestParam(required = false) String search) {
        return bookingService.getCustomers(search);
    }

    @GetMapping("/businesses/{businessId}/bookings")
    public List<BookingResponse> getBookings(@PathVariable Integer businessId) {
        return bookingService.getBookingsByBusiness(businessId);
    }

    @PostMapping("/businesses/{businessId}/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(
            @PathVariable Integer businessId,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return bookingService.createBooking(businessId, request);
    }

    @PutMapping("/businesses/{businessId}/bookings/{bookingId}")
    public BookingResponse updateBooking(
            @PathVariable Integer businessId,
            @PathVariable Integer bookingId,
            @Valid @RequestBody UpdateBookingRequest request
    ) {
        return bookingService.updateBooking(businessId, bookingId, request);
    }

    @GetMapping("/businesses/{businessId}/analytics")
    public AnalyticsResponse getAnalytics(@PathVariable Integer businessId) {
        return bookingService.getAnalytics(businessId);
    }
}
