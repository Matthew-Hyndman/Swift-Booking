package com.web.app.swift_booking.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.app.swift_booking.dto.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserRepresentation_DTO;
import com.web.app.swift_booking.service.Keycloak.OrganizationService_Impl;


@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService_Impl organizationService;
    
    public OrganizationController(OrganizationService_Impl organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping("id/{organizationId}")
    public ResponseEntity<OrganizationRepresentation_DTO> getOrganizationById(
        @PathVariable String organizationId
    ) {
        ResponseEntity<OrganizationRepresentation_DTO> response = this.organizationService.getOrganizationById(organizationId);
        return response;
    }

    @GetMapping("get/{ownerId}")
    public ResponseEntity<OrganizationRepresentation_DTO> getOrganizationByOwnerId(
        @PathVariable String ownerId
    ) {
        ResponseEntity<OrganizationRepresentation_DTO> response = this.organizationService.getOrganizationByUserId(ownerId);
        return response;
    }

    @PostMapping("create/{userId}")
    public ResponseEntity<String> createOrganization(
        @PathVariable String userId, 
        @RequestBody OrganizationRepresentation_DTO organizationData
    ) {

        ResponseEntity<String> response = this.organizationService.createOrganization(userId, organizationData);
        // create organization and add userId as member of the organization
        return response;
    }

    @PutMapping("add-employee/{organizationId}/{groupId}")
    public ResponseEntity<String> addEmployeeToOrganization(
        @PathVariable String organizationId,        
        @PathVariable String groupId,
        @RequestBody UserRepresentation_DTO userData
    ) {
        ResponseEntity<String> response = this.organizationService.addEmployeeToOrganization(organizationId, groupId, userData);
        return response;
    }
    
    
    
}
