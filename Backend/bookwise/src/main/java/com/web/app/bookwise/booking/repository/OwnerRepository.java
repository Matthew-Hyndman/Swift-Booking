package com.web.app.bookwise.booking.repository;

import com.web.app.bookwise.booking.model.Owner;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerRepository extends JpaRepository<Owner, Integer> {
}
