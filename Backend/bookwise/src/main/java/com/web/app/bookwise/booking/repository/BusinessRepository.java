package com.web.app.bookwise.booking.repository;

import com.web.app.bookwise.booking.model.Business;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessRepository extends JpaRepository<Business, Integer> {
}
