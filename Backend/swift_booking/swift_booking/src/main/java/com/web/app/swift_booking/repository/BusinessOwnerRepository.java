package com.web.app.swift_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.swift_booking.entity.BusinessOwner;
import com.web.app.swift_booking.entity.BusinessOwnerId;

public interface BusinessOwnerRepository extends JpaRepository<BusinessOwner, BusinessOwnerId> {
}
