package com.web.app.bookwise.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.bookwise.booking.entity.BusinessAddress;
import com.web.app.bookwise.booking.entity.BusinessAddressId;

public interface BusinessAddressRepository extends JpaRepository<BusinessAddress, BusinessAddressId> {
}
