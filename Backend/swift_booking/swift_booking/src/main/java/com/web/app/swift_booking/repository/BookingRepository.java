package com.web.app.swift_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.web.app.swift_booking.entity.Booking;
import com.web.app.swift_booking.entity.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
/* 
    List<Booking> findByBusinessBusinessIdOrderByBookingDateDescStartTimeDesc(UUID organizationId);

    long countByBusinessBusinessId(UUID organizationId);

    long countByBusinessBusinessIdAndStatus(UUID organizationId, BookingStatus status);

    boolean existsByEmployeeEmployeeIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThan(
            UUID UserId,
            LocalDate bookingDate,
            LocalTime endTime,
            LocalTime startTime
    );

        boolean existsByEmployeeEmployeeIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndBookingIdNot(
            UUID UserId,
            LocalDate bookingDate,
            LocalTime endTime,
            LocalTime startTime,
            UUID bookingId
        );

    @Query("""
        select concat(ue.firstName, ' ', ue.lastName), count(b)
        from Booking b
        join b.user_entity ue
        where b.business.businessId = :organizationId
        group by ue.firstName, ue.lastName
    """)
    List<Object[]> countBookingsByEmployee(@Param("organizationId") UUID organizationId);
    */ 
}
