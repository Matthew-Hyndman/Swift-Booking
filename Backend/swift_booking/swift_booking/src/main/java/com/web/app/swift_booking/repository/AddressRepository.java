package com.web.app.swift_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.swift_booking.entity.Address;

public interface AddressRepository extends JpaRepository<Address, Integer> {
}
