package com.web.app.swift_booking.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.swift_booking.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    List<Customer> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrderByFirstNameAscLastNameAsc(
            String firstName,
            String lastName
    );

    List<Customer> findAllByOrderByFirstNameAscLastNameAsc();
}
