package com.web.app.bookwise.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.bookwise.booking.entity.Owner;

public interface OwnerRepository extends JpaRepository<Owner, Integer> {
}
