package com.web.app.small_business_appointments.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.app.small_business_appointments.dto.AnalyticsResponse;
import com.web.app.small_business_appointments.dto.BookingResponse;
import com.web.app.small_business_appointments.dto.BusinessResponse;
import com.web.app.small_business_appointments.dto.CreateBookingRequest;
import com.web.app.small_business_appointments.dto.CustomerResponse;
import com.web.app.small_business_appointments.dto.EmployeeResponse;
import com.web.app.small_business_appointments.dto.UpdateBookingRequest;
import com.web.app.small_business_appointments.entity.Booking;
import com.web.app.small_business_appointments.entity.BookingStatus;
import com.web.app.small_business_appointments.entity.Business;
import com.web.app.small_business_appointments.entity.Customer;
import com.web.app.small_business_appointments.entity.Employee;
import com.web.app.small_business_appointments.repository.BookingRepository;
import com.web.app.small_business_appointments.repository.BusinessRepository;
import com.web.app.small_business_appointments.repository.CustomerRepository;
import com.web.app.small_business_appointments.repository.EmployeeRepository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class BookingService {

    private final BusinessRepository businessRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final BookingRepository bookingRepository;

    public BookingService(
            BusinessRepository businessRepository,
            EmployeeRepository employeeRepository,
            CustomerRepository customerRepository,
            BookingRepository bookingRepository
    ) {
        this.businessRepository = businessRepository;
        this.employeeRepository = employeeRepository;
        this.customerRepository = customerRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<BusinessResponse> getBusinesses() {
        return businessRepository.findAll().stream()
                .map(this::toBusinessResponse)
                .toList();
    }

    public List<EmployeeResponse> getEmployees(Integer businessId) {
        assertBusinessExists(businessId);
        return employeeRepository.findByBusinessBusinessIdAndIsActiveTrueOrderByFirstNameAscLastNameAsc(businessId).stream()
                .map(this::toEmployeeResponse)
                .toList();
    }

    public List<CustomerResponse> getCustomers(String search) {
        List<Customer> customers;
        if (search == null || search.isBlank()) {
            customers = customerRepository.findAllByOrderByFirstNameAscLastNameAsc();
        } else {
            customers = customerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrderByFirstNameAscLastNameAsc(
                    search.trim(),
                    search.trim()
            );
        }

        return customers.stream().map(this::toCustomerResponse).toList();
    }

    public List<BookingResponse> getBookingsByBusiness(Integer businessId) {
        assertBusinessExists(businessId);
        return bookingRepository.findByBusinessBusinessIdOrderByBookingDateDescStartTimeDesc(businessId).stream()
                .map(this::toBookingResponse)
                .toList();
    }

    @Transactional
    public BookingResponse createBooking(Integer businessId, CreateBookingRequest request) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new NoSuchElementException("Business not found: " + businessId));

        Employee employee = employeeRepository
                .findByEmployeeIdAndBusinessBusinessIdAndIsActiveTrue(request.employeeId(), businessId)
                .orElseThrow(() -> new NoSuchElementException("Employee not found in business: " + request.employeeId()));

        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new NoSuchElementException("Customer not found: " + request.customerId()));

        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        boolean hasOverlap = bookingRepository.existsByEmployeeEmployeeIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
                employee.getEmployeeId(),
                request.bookingDate(),
                request.endTime(),
                request.startTime()
        );

        if (hasOverlap) {
            throw new IllegalArgumentException("Employee already has a booking in this time window");
        }

        Booking booking = new Booking();
        booking.setBusiness(business);
        booking.setEmployee(employee);
        booking.setCustomer(customer);
        booking.setBookingDate(request.bookingDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setServiceDescription(request.serviceDescription());
        booking.setStatus(BookingStatus.PENDING);
        booking.setNotes(request.notes());

        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    @Transactional
    public BookingResponse updateBooking(Integer businessId, Integer bookingId, UpdateBookingRequest request) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new NoSuchElementException("Business not found: " + businessId));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found: " + bookingId));

        if (!booking.getBusiness().getBusinessId().equals(businessId)) {
            throw new NoSuchElementException("Booking not found in business: " + bookingId);
        }

        Employee employee = employeeRepository
                .findByEmployeeIdAndBusinessBusinessIdAndIsActiveTrue(request.employeeId(), businessId)
                .orElseThrow(() -> new NoSuchElementException("Employee not found in business: " + request.employeeId()));

        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new NoSuchElementException("Customer not found: " + request.customerId()));

        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        boolean hasOverlap = bookingRepository
                .existsByEmployeeEmployeeIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndBookingIdNot(
                        employee.getEmployeeId(),
                        request.bookingDate(),
                        request.endTime(),
                        request.startTime(),
                        bookingId
                );

        if (hasOverlap) {
            throw new IllegalArgumentException("Employee already has a booking in this time window");
        }

        booking.setBusiness(business);
        booking.setEmployee(employee);
        booking.setCustomer(customer);
        booking.setBookingDate(request.bookingDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setServiceDescription(request.serviceDescription());
        booking.setStatus(request.status());
        booking.setNotes(request.notes());

        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    public AnalyticsResponse getAnalytics(Integer businessId) {
        assertBusinessExists(businessId);

        Map<String, Long> byEmployee = new LinkedHashMap<>();
        for (Object[] row : bookingRepository.countBookingsByEmployee(businessId)) {
            byEmployee.put((String) row[0], (Long) row[1]);
        }

        return new AnalyticsResponse(
                bookingRepository.countByBusinessBusinessId(businessId),
                bookingRepository.countByBusinessBusinessIdAndStatus(businessId, BookingStatus.COMPLETED),
                bookingRepository.countByBusinessBusinessIdAndStatus(businessId, BookingStatus.CONFIRMED),
                bookingRepository.countByBusinessBusinessIdAndStatus(businessId, BookingStatus.PENDING),
                bookingRepository.countByBusinessBusinessIdAndStatus(businessId, BookingStatus.CANCELLED),
                byEmployee
        );
    }

    private void assertBusinessExists(Integer businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new NoSuchElementException("Business not found: " + businessId);
        }
    }

    private BusinessResponse toBusinessResponse(Business business) {
        return new BusinessResponse(
                business.getBusinessId(),
                business.getBusinessName(),
                business.getDescription(),
                business.getPhone(),
                business.getEmail()
        );
    }

    private EmployeeResponse toEmployeeResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getEmployeeId(),
                employee.getBusiness().getBusinessId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.fullName(),
                employee.getJobTitle(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getIsActive()
        );
    }

    private CustomerResponse toCustomerResponse(Customer customer) {
        return new CustomerResponse(
                customer.getCustomerId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.fullName(),
                customer.getEmail(),
                customer.getPhone()
        );
    }

    private BookingResponse toBookingResponse(Booking booking) {
        return new BookingResponse(
                booking.getBookingId(),
                booking.getBusiness().getBusinessId(),
                booking.getEmployee().getEmployeeId(),
                booking.getEmployee().fullName(),
                booking.getCustomer().getCustomerId(),
                booking.getCustomer().fullName(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getServiceDescription(),
                booking.getStatus(),
                booking.getNotes()
        );
    }
}
