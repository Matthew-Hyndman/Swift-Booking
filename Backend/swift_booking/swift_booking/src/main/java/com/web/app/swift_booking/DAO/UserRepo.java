package com.web.app.swift_booking.DAO;

import com.web.app.swift_booking.entity.Keycloak.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, String> {

    
    
}
