package com.web.app.swift_booking.service;

import org.springframework.http.ResponseEntity;

import com.web.app.swift_booking.dto.Address_DTO;

public interface AddressService {

    ResponseEntity<?> getBranchAddress(String addressId);

    ResponseEntity<?> getAllBranchAddresses(String organizationId);

    ResponseEntity<?> addBranchAddress(String organizationId, Address_DTO addressData);

    ResponseEntity<?> updateBranchAddress(String addressId, Address_DTO addressData);

    ResponseEntity<?> deleteBranchAddress(String addressId);

    ResponseEntity<?> deleteAllBranchAddresses(String organizationId);
}
