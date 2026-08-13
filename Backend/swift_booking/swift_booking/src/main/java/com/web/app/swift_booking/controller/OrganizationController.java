package com.web.app.swift_booking.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.app.swift_booking.dto.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.MemberRepresentation_DTO;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    @GetMapping("create/{userId}")
    public String getMethodName(
        @PathVariable String userId, 
        @RequestParam OrganizationRepresentation_DTO organizationData
    ) {
        // create organization and add userId as member of the organization
        return new String();
    }

    @GetMapping("add-employee/{organizationId}")
    public String getMethodName(
        @PathVariable String organizationId,        
        @RequestParam MemberRepresentation_DTO memberData
    ) {
        // create user then add employee to the organization
        return new String();
    }
    
    
    
}
