package com.web.app.bookwise.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.bookwise.booking.entity.Address;

public interface AddressRepository extends JpaRepository<Address, Integer> {
}
