package com.web.app.small_business_appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.small_business_appointments.entity.Business;

public interface BusinessRepository extends JpaRepository<Business, Integer> {
}
