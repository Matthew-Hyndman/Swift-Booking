package com.web.app.bookwise.booking.repository;

import com.web.app.bookwise.booking.model.BusinessOwner;
import com.web.app.bookwise.booking.model.BusinessOwnerId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessOwnerRepository extends JpaRepository<BusinessOwner, BusinessOwnerId> {
}
