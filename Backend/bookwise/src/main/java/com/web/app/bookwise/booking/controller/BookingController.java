package com.web.app.bookwise.booking.controller;

import com.web.app.bookwise.booking.dto.AnalyticsResponse;
import com.web.app.bookwise.booking.dto.CreateAppointmentRequest;
import com.web.app.bookwise.booking.model.Appointment;
import com.web.app.bookwise.booking.model.Employee;
import com.web.app.bookwise.booking.service.BookingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/businesses/{businessId}")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/employees")
    public List<Employee> getEmployees(@PathVariable String businessId) {
        return bookingService.getEmployees();
    }

    @GetMapping("/appointments")
    public List<Appointment> getAppointments(@PathVariable String businessId) {
        return bookingService.getAppointmentsByBusiness(businessId);
    }

    @PostMapping("/appointments")
    public Appointment createAppointment(@PathVariable String businessId, @RequestBody CreateAppointmentRequest request) {
        return bookingService.createAppointment(businessId, request);
    }

    @GetMapping("/analytics")
    public AnalyticsResponse getAnalytics(@PathVariable String businessId) {
        return bookingService.getAnalytics(businessId);
    }
}
