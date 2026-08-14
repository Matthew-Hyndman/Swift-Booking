package com.web.app.swift_booking.service.Keycloak;

import com.web.app.swift_booking.DAO.OrganizationRepo;
import com.web.app.swift_booking.DAO.UserRepo;
import com.web.app.swift_booking.entity.Keycloak.Organization;
import com.web.app.swift_booking.entity.Keycloak.User;

import java.util.UUID;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.web.app.swift_booking.DTO.Keycloak.GroupRepresentation_DTO;
import com.web.app.swift_booking.DTO.Keycloak.MemberRepresentation_DTO;
import com.web.app.swift_booking.DTO.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.DTO.Keycloak.UserRepresentation_DTO;

@Service
public class OrganizationService_Impl implements OrganizationService {

    private final WebClient webClient = null;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private OrganizationRepo organizationRepo;

    @Value("${keycloak-details.origin}")
    private String origin;

    @Value("${keycloak-details.realm}")
    private String realm;

    /**
     * Creates a new organization and adds the specified user as a member.
     *
     * @param userId           the ID of the user creating the organization
     * @param organizationData the organization data
     */
    @Override
    public String createOrganization(String userId, OrganizationRepresentation_DTO organizationData) {

        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Adding user as a member of the organization
        organizationData.members().add(
                new MemberRepresentation_DTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getFirstName(),
                        user.getLastName(),
                        true,
                        user.getEmailVerified()));

        // Adding default groups to the organization representation
        // Owner
        organizationData.groups().add(
                new GroupRepresentation_DTO(
                        UUID.randomUUID().toString(),
                        "Owner"));

        // Manager
        organizationData.groups().add(
                new GroupRepresentation_DTO(
                        UUID.randomUUID().toString(),
                        "Manager"));

        // Employee
        organizationData.groups().add(
                new GroupRepresentation_DTO(
                        UUID.randomUUID().toString(),
                        "Employee"));

        // Customer
        organizationData.groups().add(
                new GroupRepresentation_DTO(
                        UUID.randomUUID().toString(),
                        "Customer"));

        return this.webClient.post()
                .uri(this.origin + "/admin/realms/{realm}/organizations", realm)
                .bodyValue(organizationData)
                .retrieve()
                .bodyToMono(String.class)
                .block();

    }

    /**
     * Retrieves an organization by its ID.
     *
     * @param organizationId the ID of the organization
     * @return an Optional containing the organization if found, or empty if not found
     */
    @Override
    public Optional<Organization> getOrganizationById(String organizationId) {
        return Optional.ofNullable(organizationRepo.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found")));
    }

    @Override
    public String updateOrganization(String organizationId, OrganizationRepresentation_DTO organizationData) {
        // Implementation here
        return null;
    }

    @Override
    public String deleteOrganization(String organizationId) {
        // Implementation here
        return null;
    }

    /**
     * Adds an employee to an organization.
     *
     * @param organizationId the ID of the organization
     * @param groupId        the ID of the group to which the employee will be added
     * @param userId         the ID of the user to be added as an employee
     * @return a status message
     */
    @Override
    public String addEmployeeToOrganization(String organizationId, String groupId, String userId) {
        // Create a new user, then add the 
        // user as a member of the organization
        // and add requiedActions to the user

        // Create a new user with endpoint POST /admin/realms/{realm}/users

        return this.webClient.put()
                .uri(this.origin + "/admin/realms/{realm}/organizations/{org-id}/groups/{group-id}/members/{userId}",
                        realm, organizationId, groupId, userId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    @Override
    public String removeEmployeeFromOrganization(String organizationId, String groupId, String userId) {
        // Implementation here
        return null;
    }
}
