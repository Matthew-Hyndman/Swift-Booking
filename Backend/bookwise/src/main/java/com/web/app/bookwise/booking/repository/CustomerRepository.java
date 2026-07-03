package com.web.app.bookwise.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.bookwise.booking.entity.Customer;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    List<Customer> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrderByFirstNameAscLastNameAsc(
            String firstName,
            String lastName
    );

    List<Customer> findAllByOrderByFirstNameAscLastNameAsc();
}
