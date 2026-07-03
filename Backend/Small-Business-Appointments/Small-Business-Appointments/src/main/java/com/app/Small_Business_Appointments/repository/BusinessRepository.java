package com.web.app.small-business-appointments.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.small-business-appointments.booking.entity.Business;

public interface BusinessRepository extends JpaRepository<Business, Integer> {
}
