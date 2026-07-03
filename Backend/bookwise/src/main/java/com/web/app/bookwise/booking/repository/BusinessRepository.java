package com.web.app.bookwise.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.bookwise.booking.entity.Business;

public interface BusinessRepository extends JpaRepository<Business, Integer> {
}
