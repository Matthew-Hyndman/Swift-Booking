package com.web.app.swift_booking.DAO;

import com.web.app.swift_booking.entity.Keycloak.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepo extends JpaRepository<Organization, String> {
    
}
