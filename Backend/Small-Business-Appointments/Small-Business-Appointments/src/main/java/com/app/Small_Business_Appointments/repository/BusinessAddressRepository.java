package com.web.app.small-business-appointments.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.small-business-appointments.booking.entity.BusinessAddress;
import com.web.app.small-business-appointments.booking.entity.BusinessAddressId;

public interface BusinessAddressRepository extends JpaRepository<BusinessAddress, BusinessAddressId> {
}
