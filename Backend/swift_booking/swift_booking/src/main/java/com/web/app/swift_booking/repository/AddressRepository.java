package com.web.app.swift_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.swift_booking.entity.Address;

import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, UUID> {
    // Additional query methods can be defined here if needed
}
