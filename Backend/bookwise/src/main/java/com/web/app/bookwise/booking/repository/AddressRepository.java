package com.web.app.bookwise.booking.repository;

import com.web.app.bookwise.booking.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Integer> {
}
