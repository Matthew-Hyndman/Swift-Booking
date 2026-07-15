package com.web.app.swift_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.swift_booking.entity.Owner;

public interface OwnerRepository extends JpaRepository<Owner, Integer> {
}
