package com.web.app.swift_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.swift_booking.entity.Business;

public interface BusinessRepository extends JpaRepository<Business, Integer> {
}
