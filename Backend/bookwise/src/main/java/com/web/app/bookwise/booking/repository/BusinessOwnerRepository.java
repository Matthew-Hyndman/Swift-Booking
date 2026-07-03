package com.web.app.bookwise.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.bookwise.booking.entity.BusinessOwner;
import com.web.app.bookwise.booking.entity.BusinessOwnerId;

public interface BusinessOwnerRepository extends JpaRepository<BusinessOwner, BusinessOwnerId> {
}
