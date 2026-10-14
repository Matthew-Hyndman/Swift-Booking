package com.web.app.swift_booking.DAO;

import com.web.app.swift_booking.entity.Keycloak.User;
import com.web.app.swift_booking.entity.Address;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, String> {

    List<User> findAllByAddressAddressId(UUID addressId);

    User findByAddressAddressId(UUID addressId);

    
    
}
