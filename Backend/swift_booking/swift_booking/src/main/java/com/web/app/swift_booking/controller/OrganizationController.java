package com.web.app.swift_booking.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.app.swift_booking.dto.Address_DTO;
import com.web.app.swift_booking.dto.Keycloak.EmptyOrg_DTO;
import com.web.app.swift_booking.dto.Keycloak.GroupRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.SimpleOrgDetail_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserAddressAssignment_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserGroupAssignment_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserRepresentation_DTO;
import com.web.app.swift_booking.service.AddressService;
import com.web.app.swift_booking.service.Keycloak.OrganizationService_Impl;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService_Impl organizationService;
    private final AddressService addressService;

    public OrganizationController(OrganizationService_Impl organizationService, AddressService addressService) {
        this.organizationService = organizationService;
        this.addressService = addressService;
    }

    /**
     * Get a list of simplified organization details for the specified user.
     * @param userId The ID of the user for whom to retrieve simplified organization details.
     * @return A ResponseEntity containing a list of SimpleOrgDetail_DTO objects representing the simplified organization details for the specified user.
     */
    @GetMapping("small-info/{userId}")
    public ResponseEntity<List<SimpleOrgDetail_DTO>> getSmallOrgInfo(@PathVariable String userId) {
        try {
            List<SimpleOrgDetail_DTO> smallOrgInfo = this.organizationService.getSmallOrgInfo(userId);
            return ResponseEntity.ok(smallOrgInfo);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create an organization and add the specified user as a member of the organization.
     * @param userId The ID of the user to be added as a member of the newly created organization.
     * @param organizationData The data for the organization to be created.
     * @return A ResponseEntity containing a message indicating the result of the create operation.
     */
    /*@PostMapping("create/{userId}")
    public ResponseEntity<String> createOrganization(
        @PathVariable String userId,
        @RequestBody OrganizationRepresentation_DTO organizationData
    ) {
        return this.organizationService.createOrganization(userId, organizationData);
    }*/

    @PostMapping("create-empty")
    public ResponseEntity<?> createEmptyOrg(@RequestBody EmptyOrg_DTO emptyOrgData){
        return this.organizationService.createEmptyOrganization(emptyOrgData);
    }

    @PostMapping("create-default-org-groups/{orgId}")
    public ResponseEntity<?> createOrgGroups(@PathVariable String orgId) {
        return this.organizationService.createDefaultOrganizationGroups(orgId);
    }

    @PostMapping("{organizationId}/addresses")
    public ResponseEntity<?> addOrganizationAddresses(
        @PathVariable String organizationId,
        @RequestBody List<Address_DTO> addressData
    ) {
        return this.organizationService.addOrganizationAddresses(organizationId, addressData);
    }

    @PostMapping("create-users")
    public ResponseEntity<?> createUsers(@RequestBody List<UserRepresentation_DTO> users) {
        return this.organizationService.createUsers(users);
    }

    @PutMapping("assign-users-to-addresses")
    public ResponseEntity<?> assignUsersToAddresses(@RequestBody List<UserAddressAssignment_DTO> assignments) {
        return this.organizationService.assignUsersToAddresses(assignments);
    }

    @PutMapping("{organizationId}/assign-users-as-members")
    public ResponseEntity<?> assignUsersAsMembers(
        @PathVariable String organizationId,
        @RequestBody List<String> userIds
    ) {
        return this.organizationService.assignUsersAsMembers(organizationId, userIds);
    }

    @PutMapping("{organizationId}/assign-users-to-groups")
    public ResponseEntity<?> assignUsersToGroups(
        @PathVariable String organizationId,
        @RequestBody List<UserGroupAssignment_DTO> assignments
    ) {
        return this.organizationService.assignUsersAsMembersToGroups(organizationId, assignments);
    }

    // Address management endpoints for organizations

    @GetMapping("{organizationId}/addresses")
    public ResponseEntity<?> getOrganizationAddresses(@PathVariable String organizationId) {
        return addressService.getAllBranchAddresses(organizationId);
    }

    @PostMapping("{organizationId}/addresses")
    public ResponseEntity<?> addOrganizationAddress(
        @PathVariable String organizationId,
        @RequestBody Address_DTO addressData
    ) {
        return addressService.addBranchAddress(organizationId, addressData);
    }

    @PutMapping("addresses/{addressId}")
    public ResponseEntity<?> updateOrganizationAddress(
        @PathVariable String addressId,
        @RequestBody Address_DTO addressData
    ) {
        return addressService.updateBranchAddress(addressId, addressData);
    }

    @PutMapping("add-employee/{organizationId}/{groupId}")
    public ResponseEntity<String> addEmployeeToOrganization(
        @PathVariable String organizationId,
        @PathVariable String groupId,
        @RequestBody UserRepresentation_DTO userData
    ) {
        return this.organizationService.addEmployeeToOrganization(organizationId, groupId, userData);
    }

    @PutMapping("{organizationId}/addresses/{addressId}")
    public ResponseEntity<?> updateOrganizationAddressInOrg(
        @PathVariable String organizationId,
        @PathVariable String addressId,
        @RequestBody Address_DTO addressData
    ) {
        return addressService.updateBranchAddress(addressId, addressData);
    }

    @DeleteMapping("addresses/{addressId}")
    public ResponseEntity<?> deleteOrganizationAddress(@PathVariable String addressId) {
        return addressService.deleteBranchAddress(addressId);
    }

    @DeleteMapping("{organizationId}/addresses")
    public ResponseEntity<?> deleteAllOrganizationAddresses(@PathVariable String organizationId) {
        return addressService.deleteAllBranchAddresses(organizationId);
    }
}
