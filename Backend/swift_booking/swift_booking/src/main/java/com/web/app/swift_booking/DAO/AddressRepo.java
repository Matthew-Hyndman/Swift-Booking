package com.web.app.swift_booking.DAO;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.swift_booking.entity.Address;

public interface AddressRepo extends JpaRepository<Address, UUID> {
    List<Address> findAllByOrganization_Id(String organizationId);
    void deleteByOrganization_Id(String organizationId);
}
