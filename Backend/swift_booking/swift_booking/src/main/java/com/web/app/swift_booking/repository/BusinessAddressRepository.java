package com.web.app.swift_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.swift_booking.entity.BusinessAddress;
import com.web.app.swift_booking.entity.BusinessAddressId;

public interface BusinessAddressRepository extends JpaRepository<BusinessAddress, BusinessAddressId> {
}
