package com.web.app.swift_booking.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.web.app.swift_booking.DAO.AddressRepo;
import com.web.app.swift_booking.DAO.OrganizationRepo;
import com.web.app.swift_booking.dto.Address_DTO;
import com.web.app.swift_booking.entity.Address;
import com.web.app.swift_booking.entity.Keycloak.Organization;

@Service
public class AddressService_Impl implements AddressService {

    private final AddressRepo addressRepo;
    private final OrganizationRepo organizationRepo;

    public AddressService_Impl(AddressRepo addressRepo, OrganizationRepo organizationRepo) {
        this.addressRepo = addressRepo;
        this.organizationRepo = organizationRepo;
    }

    @Override
    public ResponseEntity<?> getBranchAddress(String addressId) {
        try {
            UUID parsedAddressId = UUID.fromString(addressId);
            return addressRepo.findById(parsedAddressId)
                    .map(address -> ResponseEntity.ok(toAddressDto(address)))
                    .orElseThrow(() -> new RuntimeException("Branch address not found: " + addressId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid branch address id: " + addressId);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body("Branch address not found: " + addressId);
        }

    }

    @Override
    public ResponseEntity<?> getAllBranchAddresses(String organizationId) {
        List<Address_DTO> addresses = addressRepo.findAllByOrganization_Id(organizationId).stream()
                .map(this::toAddressDto)
                .toList();
        return ResponseEntity.ok(addresses);
    }

    @Override
    public ResponseEntity<?> addBranchAddress(String organizationId, Address_DTO addressData) {
        try {
            Organization organization = organizationRepo.findById(organizationId)
                    .orElseThrow(() -> new RuntimeException("Organization not found: " + organizationId));
            Address address = toAddressEntity(addressData, organization);
            addressRepo.save(address);
            return ResponseEntity.ok("Branch address added");
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Error adding branch address: " + ex.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateBranchAddress(String addressId, Address_DTO addressData) {
        try {
            UUID parsedAddressId = UUID.fromString(addressId);
            Address existing = addressRepo.findById(parsedAddressId)
                    .orElseThrow(() -> new RuntimeException("Branch address not found: " + addressId));

            Organization organization = existing.getOrganization();
            if (organization == null && addressData.organizationId() != null) {
                organization = organizationRepo.findById(addressData.organizationId())
                        .orElseThrow(() -> new RuntimeException("Organization not found: " + addressData.organizationId()));
            }

            Address updated = toAddressEntity(addressData, organization);
            updated.setAddressId(existing.getAddressId());
            updated.setCreatedAt(existing.getCreatedAt());
            addressRepo.save(updated);
            return ResponseEntity.ok("Branch address updated");
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Error updating branch address: " + ex.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteBranchAddress(String addressId) {
        try {
            UUID parsedAddressId = UUID.fromString(addressId);
            if (!addressRepo.existsById(parsedAddressId)) {
                return ResponseEntity.status(404).body("Branch address not found");
            }
            addressRepo.deleteById(parsedAddressId);
            return ResponseEntity.ok("Branch address deleted");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid branch address id: " + addressId);
        }
    }

    @Override
    public ResponseEntity<?> deleteAllBranchAddresses(String organizationId) {
        try {
            addressRepo.deleteByOrganization_Id(organizationId);
            return ResponseEntity.ok("All branch addresses deleted for organization: " + organizationId);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Error deleting branch addresses: " + ex.getMessage());
        }
    }

    public Address toAddressEntity(Address_DTO addressData, Organization organization) {
        Address address = new Address();
        if (addressData == null) {
            return address;
        }

        if (addressData.addressId() != null) {
            address.setAddressId(addressData.addressId());
        }
        address.setAddressName(addressData.addressName() == null || addressData.addressName().isBlank()
                ? "Branch address"
                : addressData.addressName());
        address.setStreetLine1(addressData.streetLine1());
        address.setStreetLine2(addressData.streetLine2());
        address.setCity(addressData.city());
        address.setCounty(addressData.county());
        address.setPostalCode(addressData.postalCode());
        address.setCountry(addressData.country());
        if (addressData.createdAt() != null) {
            address.setCreatedAt(addressData.createdAt());
        }
        address.setOrganization(organization);
        return address;
    }

    private Address_DTO toAddressDto(Address address) {
        /*return new Address_DTO(
                address.getAddressId(),
                address.getAddressName(),
                address.getStreetLine1(),
                address.getStreetLine2(),
                address.getCity(),
                address.getCounty(),
                address.getPostalCode(),
                address.getCountry(),
                address.getCreatedAt(),
                address.getOrganization() != null ? address.getOrganization().getId() : null
        );*/
        return null;
    }
}
