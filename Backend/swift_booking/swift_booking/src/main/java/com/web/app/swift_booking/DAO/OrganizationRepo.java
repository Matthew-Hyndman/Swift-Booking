package com.web.app.swift_booking.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.swift_booking.entity.Keycloak.Organization;

public interface OrganizationRepo extends JpaRepository<Organization, String> {
    
    
    
}
