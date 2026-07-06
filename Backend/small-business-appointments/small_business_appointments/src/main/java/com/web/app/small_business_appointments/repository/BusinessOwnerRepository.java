package com.web.app.small_business_appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.small_business_appointments.entity.BusinessOwner;
import com.web.app.small_business_appointments.entity.BusinessOwnerId;

public interface BusinessOwnerRepository extends JpaRepository<BusinessOwner, BusinessOwnerId> {
}
