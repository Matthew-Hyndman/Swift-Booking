package com.web.app.small-business-appointments.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.web.app.small-business-appointments.booking.entity.Booking;
import com.web.app.small-business-appointments.booking.entity.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByBusinessBusinessIdOrderByBookingDateDescStartTimeDesc(Integer businessId);

    long countByBusinessBusinessId(Integer businessId);

    long countByBusinessBusinessIdAndStatus(Integer businessId, BookingStatus status);

    boolean existsByEmployeeEmployeeIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
            Integer employeeId,
            LocalDate bookingDate,
            LocalTime endTime,
            LocalTime startTime
    );

    @Query("""
        select concat(e.firstName, ' ', e.lastName), count(b)
        from Booking b
        join b.employee e
        where b.business.businessId = :businessId
        group by e.firstName, e.lastName
    """)
    List<Object[]> countBookingsByEmployee(@Param("businessId") Integer businessId);
}
