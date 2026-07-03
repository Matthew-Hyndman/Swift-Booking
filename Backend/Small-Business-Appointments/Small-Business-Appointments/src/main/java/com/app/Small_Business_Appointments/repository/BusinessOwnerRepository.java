package com.web.app.small-business-appointments.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.small-business-appointments.booking.entity.BusinessOwner;
import com.web.app.small-business-appointments.booking.entity.BusinessOwnerId;

public interface BusinessOwnerRepository extends JpaRepository<BusinessOwner, BusinessOwnerId> {
}
