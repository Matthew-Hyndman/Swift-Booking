package com.web.app.bookwise.booking.repository;

import com.web.app.bookwise.booking.model.BusinessAddress;
import com.web.app.bookwise.booking.model.BusinessAddressId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessAddressRepository extends JpaRepository<BusinessAddress, BusinessAddressId> {
}
