package com.web.app.small_business_appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.small_business_appointments.entity.BusinessAddress;
import com.web.app.small_business_appointments.entity.BusinessAddressId;

public interface BusinessAddressRepository extends JpaRepository<BusinessAddress, BusinessAddressId> {
}
