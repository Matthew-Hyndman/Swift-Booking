package com.web.app.swift_booking.service.Keycloak;

import com.web.app.swift_booking.DAO.AddressRepo;
import com.web.app.swift_booking.DAO.OrganizationRepo;
import com.web.app.swift_booking.DAO.UserRepo;
import com.web.app.swift_booking.dto.Address_DTO;
import com.web.app.swift_booking.dto.Address_DTO;
import com.web.app.swift_booking.entity.Address;
import com.web.app.swift_booking.entity.Keycloak.Organization;
import com.web.app.swift_booking.entity.Keycloak.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.web.app.swift_booking.dto.Keycloak.EmptyOrg_DTO;
import com.web.app.swift_booking.dto.Keycloak.GroupRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.MemberRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.MemberRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.SimpleOrgDetail_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserAddressAssignment_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserGroupAssignment_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserRepresentation_DTO;

@Service
public class OrganizationService_Impl implements OrganizationService {

        private record KeycloakTokenResponse(String access_token) {
        }

        private final UserRepo userRepo;

        private final OrganizationRepo orgRepo;
        private final AddressRepo addressRepo;

        @Value("${keycloak-details.origin}")
        private String origin;

        @Value("${keycloak-details.realm}")
        private String realm;

        @Value("${keycloak-details.client-id}")
        private String clientId;

        @Value("${keycloak-details.secret}")
        private String secret;

        private final WebClient keycloakHttpClient = WebClient.builder()
                        .defaultHeader("Content-Type", "application/json")
                        .build();

        OrganizationService_Impl(UserRepo userRepo, OrganizationRepo orgRepo, AddressRepo addressRepo) {
                this.userRepo = userRepo;
                this.orgRepo = orgRepo;
                this.addressRepo = addressRepo;
        }

        /**
         * Creates a new organization and adds the specified user as a member.
         *
         * @param userId           the ID of the user creating the organization
         * @param organizationData the organization data
         */
        @Override
        public ResponseEntity<String> createOrganization(String userId,
                        OrganizationRepresentation_DTO organizationData) {

                try {
                        String accessToken = getAdminAccessToken();
                        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

                        // Keycloak organization create does not reliably persist nested members/groups.
                        // Create the organization first, then add groups/member through dedicated
                        // endpoints.
                        OrganizationRepresentation_DTO createRequest = new OrganizationRepresentation_DTO();
                        createRequest.setId(organizationData.getId());
                        createRequest.setName(organizationData.getName());
                        createRequest.setAlias(organizationData.getAlias());
                        createRequest.setEnabled(organizationData.isEnabled());
                        createRequest.setDescription(organizationData.getDescription());
                        createRequest.setRedirectUrl(organizationData.getRedirectUrl());
                        // createRequest.setMembers(organizationData.getMembers());

                        ResponseEntity<String> createResponse = this.keycloakHttpClient.post()
                                        .uri(this.origin + "/admin/realms/{realm}/organizations", realm)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .bodyValue(createRequest)
                                        .retrieve()
                                        .onStatus(HttpStatusCode::is4xxClientError, response -> response
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException("Client Error: " + body))))
                                        .onStatus(HttpStatusCode::is5xxServerError, response -> response
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException("Server Error: " + body))))
                                        .toEntity(String.class)
                                        .block();

                        // after creating the organization, extract the organization ID from the response
                        // then use it to create default groups and assign the owner and any other 
                        // members to the appropriate groups

                        String organizationId = extractResourceId(createResponse);
                        if (organizationId == null || organizationId.isBlank()) {
                                throw new RuntimeException(
                                                "Organization created but could not resolve organization ID from Keycloak response");
                        }

                        //persistOrganizationMetadata(organizationId, organizationData);
                        List<Address> persistedAddresses = persistOrganizationAddresses(organizationId, organizationData);
                        Map<String, String> defaultGroupIds = createDefaultGroups(accessToken, organizationId);
                        assignOrganizationMembers(accessToken, organizationId, user.getId(), organizationData,
                                        defaultGroupIds, persistedAddresses);

                        String responseMessage = "Organization created with default groups, member assignments, and addresses linked";
                        return ResponseEntity.ok(responseMessage);
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("Error creating organization: " + e.getMessage());
                }

        }

        /**
         * Retrieves an organization by its ID.
         *
         * @param organizationId the ID of the organization
         * @return an Optional containing the organization if found, or empty if not
         *         found
         */
        @Override
        public Optional<Organization> getOrganizationById(String organizationId) {
                return Optional.ofNullable(orgRepo.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException("Organization not found")));
        }

        @Override
        public List<SimpleOrgDetail_DTO> getSmallOrgInfo(String userId) {
                String accessToken = getAdminAccessToken();

                ResponseEntity<List<Organization>> organizationsResponse = this.keycloakHttpClient.get()
                                .uri(this.origin + "/admin/realms/{realm}/organizations/members/{userId}/organizations",
                                                realm, userId)
                                .headers(headers -> {
                                        headers.setBearerAuth(accessToken);
                                })
                                .retrieve()
                                .onStatus(HttpStatusCode::is4xxClientError, response -> {
                                        if (response.statusCode().isSameCodeAs(HttpStatusCode.valueOf(404))) {
                                                return Mono.error(new NoSuchElementException(
                                                                "Organization not found for user: " + userId));
                                        }
                                        return response.bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(new RuntimeException(
                                                                        "Client error retrieving organization: "
                                                                                        + body)));
                                })
                                .onStatus(HttpStatusCode::is5xxServerError, response -> response
                                                .bodyToMono(String.class)
                                                .flatMap(body -> Mono.error(new RuntimeException(
                                                                "Server error retrieving organization: " + body))))
                                .toEntityList(Organization.class)
                                .block();

                List<Organization> organizations = organizationsResponse != null ? organizationsResponse.getBody()
                                : null;

                if (organizations == null || organizations.isEmpty()) {
                        throw new NoSuchElementException("Organization not found for user: " + userId);
                }

                return organizations.stream()
                                .map(organization -> new SimpleOrgDetail_DTO(organization.getId(),
                                                organization.getName()))
                                .collect(Collectors.toList());
        }

        // not implemented yet
        @Override
        public String updateOrganization(String organizationId, OrganizationRepresentation_DTO organizationData) {
                try {
                        String accessToken = getAdminAccessToken();
                        OrganizationRepresentation_DTO updateRequest = new OrganizationRepresentation_DTO();
                        updateRequest.setId(organizationId);
                        updateRequest.setName(organizationData.getName());
                        updateRequest.setAlias(organizationData.getAlias());
                        updateRequest.setEnabled(organizationData.isEnabled());
                        updateRequest.setDescription(organizationData.getDescription());
                        updateRequest.setRedirectUrl(organizationData.getRedirectUrl());

                        this.keycloakHttpClient.put()
                                        .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}",
                                                        realm,
                                                        organizationId)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .bodyValue(updateRequest)
                                        .retrieve()
                                        .onStatus(HttpStatusCode::is4xxClientError, response -> response
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException(
                                                                                        "Client Error updating organization: "
                                                                                                        + body))))
                                        .onStatus(HttpStatusCode::is5xxServerError, response -> response
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException(
                                                                                        "Server Error updating organization: "
                                                                                                        + body))))
                                        .toBodilessEntity()
                                        .block();

                        persistOrganizationMetadata(organizationId, organizationData);
                        persistOrganizationAddresses(organizationId, organizationData);
                        return "Organization updated";
                } catch (Exception e) {
                        return "Error updating organization: " + e.getMessage();
                }
        }

        @Override
        public String deleteOrganization(String organizationId) {
                try {
                        String accessToken = getAdminAccessToken();
                        addressRepo.deleteByOrganization_Id(organizationId);
                        orgRepo.deleteById(organizationId);

                        this.keycloakHttpClient.delete()
                                        .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}",
                                                        realm,
                                                        organizationId)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .retrieve()
                                        .onStatus(HttpStatusCode::is4xxClientError, response -> response
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException(
                                                                                        "Client Error deleting organization: "
                                                                                                        + body))))
                                        .onStatus(HttpStatusCode::is5xxServerError, response -> response
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException(
                                                                                        "Server Error deleting organization: "
                                                                                                        + body))))
                                        .toBodilessEntity()
                                        .block();
                        return "Organization deleted";
                } catch (Exception e) {
                        return "Error deleting organization: " + e.getMessage();
                }
        }

        /**
         * Adds an employee to an organization by creating a new user and adding them to
         * the specified group.
         *
         * @param organizationId the ID of the organization
         * @param groupId        the ID of the group to which the employee will be added
         * @param userData       the data of the user to be added as an employee
         * @return a status message
         */
        @Override
        public ResponseEntity<String> addEmployeeToOrganization(String organizationId, String groupId,
                        UserRepresentation_DTO userData) {
                try {
                        String accessToken = getAdminAccessToken();
                        // userData.requiredActions().add("VERIFY_EMAIL");
                        // userData.requiredActions().add("CONFIGURE_TOTP");

                        // Create a new user
                        ResponseEntity<String> userCreationResponse = this.keycloakHttpClient.post()
                                        .uri(this.origin + "/admin/realms/{realm}/users", realm)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .bodyValue(userData)
                                        .retrieve()
                                        .toEntity(String.class)
                                        .block();

                        if (userCreationResponse == null || userCreationResponse.getStatusCode().isError()) {
                                throw new RuntimeException("Failed to create user in Keycloak");
                        }

                        String userId = extractResourceId(userCreationResponse);

                        addUserAsMemberToOrganization(accessToken, organizationId, userId);

                        // Add the user to the specified group in the organization
                        this.keycloakHttpClient.put()
                                        .uri(this.origin + "/admin/realms/{realm}/organizations/{org-id}/groups/{group-id}/members/{userId}",
                                                        realm, organizationId, groupId, userId)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();
                        return ResponseEntity.ok("Employee added to organization");
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body("Error adding employee to organization: " + e.getMessage());
                }
        }

        private void persistOrganizationMetadata(String organizationId,
                        OrganizationRepresentation_DTO organizationData) {
                if (organizationData == null) {
                        return;
                }

                Organization organization = orgRepo.findById(organizationId).orElseGet(() -> {
                        Organization newOrganization = new Organization();
                        newOrganization.setId(organizationId);
                        return newOrganization;
                });

                organization.setName(organizationData.getName());
                organization.setAlias(organizationData.getAlias());
                organization.setEnabled(organizationData.isEnabled());
                organization.setDescription(organizationData.getDescription());
                organization.setRedirectUrl(organizationData.getRedirectUrl());
                orgRepo.save(organization);
        }

        private List<Address> persistOrganizationAddresses(String organizationId,
                        OrganizationRepresentation_DTO organizationData) {
                if (organizationId == null || organizationId.isBlank() || organizationData == null) {
                        return List.of();
                }

                Organization organization = orgRepo.findById(organizationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Organization metadata not found for address persistence: "
                                                                + organizationId));

                addressRepo.deleteByOrganization_Id(organizationId);

                if (organizationData.getBranches() == null || organizationData.getBranches().isEmpty()) {
                        return List.of();
                }
                
                List<Address> savedAddresses = new ArrayList<>();
                for (Address_DTO branch : organizationData.getBranches()) {
                        if (branch == null) {
                                continue;
                        }

                        
                        Address savedAddress = saveAddress(branch, organization);
                        if (savedAddress == null) {
                                continue;
                        }
                        savedAddresses.add(savedAddress);
                }

                return savedAddresses;
        }


        private Address saveAddress(Address_DTO addressData, Organization organization) {
                if (addressData == null) {
                        return null;
                }

                Address address = new Address();
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
                address.setBillingAddress(addressData.isBillingAddress());
                address.setOrganization(organization);

                if (address.getStreetLine1() == null || address.getCity() == null || address.getCountry() == null) {
                        return null;
                }

                return addressRepo.save(address);
        }

        private Map<String, String> createDefaultGroups(String accessToken, String organizationId) {
                Map<String, String> defaultGroupIds = new HashMap<>();
                List<String> defaultGroupNames = List.of("Owner", "Manager", "Employee", "Customer");
                for (String groupName : defaultGroupNames) {
                        String groupId = createOrganizationGroup(accessToken, organizationId, groupName);
                        if (groupId == null || groupId.isBlank()) {
                                throw new RuntimeException("Failed to create organization group: " + groupName);
                        }
                        defaultGroupIds.put(groupName, groupId);
                }
                return defaultGroupIds;
        }

        /**
         * 
         * Assigns members to their respective groups within the organization.
         * 
         * This method ensures that each member of the organization is added to the
         * appropriate
         * group based on their role and address association.
         * 
         * @param accessToken        - The access token used for authentication with the
         *                           Keycloak server.
         * @param organizationId     - The ID of the organization to which members are
         *                           being assigned.
         * @param ownerUserId        - The user ID of the organization owner.
         * @param organizationData   - The data representation of the organization,
         *                           including its members.
         * @param defaultGroupIds    - A map of default group names to their
         *                           corresponding IDs within the organization.
         * @param persistedAddresses - A list of addresses that have been persisted for
         *                           the organization.
         */
        private void assignOrganizationMembers(String accessToken, String organizationId, String ownerUserId,
                        OrganizationRepresentation_DTO organizationData, Map<String, String> defaultGroupIds,
                        List<Address> persistedAddresses) {
                String ownerGroupId = defaultGroupIds.get("Owner");
                if (ownerGroupId == null || ownerGroupId.isBlank()) {
                        throw new RuntimeException("Owner group was not created for organization");
                }
                addMemberToOrganizationGroup(accessToken, organizationId, ownerGroupId, ownerUserId);

                Set<String> validAddressIds = persistedAddresses.stream()
                                .map(Address::getAddressId)
                                .filter(Objects::nonNull)
                                .map(UUID::toString)
                                .collect(Collectors.toSet());

                Set<String> processedUsers = new HashSet<>();
                processedUsers.add(ownerUserId);

                if (organizationData == null || organizationData.getMembers() == null) {
                        return;
                }

                for (MemberRepresentation_DTO member : organizationData.getMembers()) {
                        if (member == null || member.id() == null || member.id().isBlank()) {
                                continue;
                        }
                        if (!processedUsers.add(member.id())) {
                                continue;
                        }

                        String groupName = normalizeGroupName(member.groupName(), ownerUserId.equals(member.id()));
                        String groupId = defaultGroupIds.get(groupName);
                        if (groupId == null || groupId.isBlank()) {
                                throw new RuntimeException("No group ID found for group: " + groupName);
                        }

                        addMemberToOrganizationGroup(accessToken, organizationId, groupId, member.id());

                        if (member.addressId() != null) {
                                attachAddressToUser(member.id(), organizationId, member.addressId(), validAddressIds);
                        }
                }
                for (MemberRepresentation_DTO member : organizationData.getMembers()) {
                        if (member == null || member.id() == null || member.id().isBlank()) {
                                continue;
                        }
                        if (!processedUsers.add(member.id())) {
                                continue;
                        }

                        String groupName = normalizeGroupName(member.groupName(), ownerUserId.equals(member.id()));
                        String groupId = defaultGroupIds.get(groupName);
                        if (groupId == null || groupId.isBlank()) {
                                throw new RuntimeException("No group ID found for group: " + groupName);
                        }

                        addMemberToOrganizationGroup(accessToken, organizationId, groupId, member.id());

                        if (member.addressId() != null) {
                                attachAddressToUser(member.id(), organizationId, member.addressId(), validAddressIds);
                        }
                }
        }

        private String normalizeGroupName(String requestedGroupName, boolean owner) {
                if (owner) {
                        return "Owner";
                }
                if (requestedGroupName == null || requestedGroupName.isBlank()) {
                        return "Employee";
                }

                String normalized = requestedGroupName.trim().toLowerCase();
                return switch (normalized) {
                        case "owner" -> "Owner";
                        case "manager" -> "Manager";
                        case "employee" -> "Employee";
                        case "customer" -> "Customer";
                        default -> "Employee";
                };
        }

        private void attachAddressToUser(String userId, String organizationId, UUID addressId,
                        Set<String> validAddressIds) {
                if (addressId == null) {
                        return;
                }

                String normalizedAddressId = addressId.toString();
                if (!validAddressIds.contains(normalizedAddressId)) {
                        throw new RuntimeException(
                                        "Address " + normalizedAddressId
                                                        + " is not one of the organization branch addresses");
                }

                User user = userRepo.findById(userId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Member user not found for address assignment: " + userId));
                Address address = addressRepo.findById(addressId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Address not found for assignment: " + normalizedAddressId));

                if (address.getOrganization() == null || !organizationId.equals(address.getOrganization().getId())) {
                        throw new RuntimeException(
                                        "Address " + normalizedAddressId + " does not belong to organization "
                                                        + organizationId);
                }

                user.setAddress(address);
                userRepo.save(user);
        }

        private String createOrganizationGroup(String accessToken, String organizationId, String groupName) {
                ResponseEntity<String> groupResponse = this.keycloakHttpClient.post()
                                .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}/groups", realm,
                                                organizationId)
                                .headers(headers -> headers.setBearerAuth(accessToken))
                                .bodyValue(new GroupRepresentation_DTO(null, groupName))
                                .retrieve()
                                .onStatus(HttpStatusCode::is4xxClientError, response -> response
                                                .bodyToMono(String.class)
                                                .flatMap(body -> Mono.error(
                                                                new RuntimeException(
                                                                                "Client Error creating group '"
                                                                                                + groupName
                                                                                                + "': " + body))))
                                .onStatus(HttpStatusCode::is5xxServerError, response -> response
                                                .bodyToMono(String.class)
                                                .flatMap(body -> Mono.error(
                                                                new RuntimeException(
                                                                                "Server Error creating group '"
                                                                                                + groupName
                                                                                                + "': " + body))))
                                .toEntity(String.class)
                                .block();

                return extractResourceId(groupResponse);
        }

        /**
         * Extracts the resource ID from the Keycloak response. It first checks
         * the "Location" header for the ID. If not found, it attempts to
         * parse the response body as JSON and extract the "id" field.
         * 
         * @param response The response entity from which to extract the resource ID.
         * @return The extracted resource ID, or null if not found.
         */
        private String extractResourceId(ResponseEntity<String> response) {
                if (response == null) {
                        return null;
                }

                String location = response.getHeaders().getFirst("Location");
                if (location != null && !location.isBlank()) {
                        int idx = location.lastIndexOf('/');
                        if (idx >= 0 && idx + 1 < location.length()) {
                                return location.substring(idx + 1);
                        }
                }

                String body = response.getBody();
                if (body == null || body.isBlank()) {
                        return null;
                }

                try {
                        JsonNode root = new ObjectMapper().readTree(body);
                        JsonNode idNode = root.get("id");
                        if (idNode != null && !idNode.isNull()) {
                                return idNode.asText();
                        }
                } catch (Exception ignored) {
                        // Ignore parse failures and return null; caller handles missing id.
                }

                return null;
        }

        private void addUserAsMemberToOrganization(String accessToken, String organizationId, String userId) {
                ResponseEntity<String> response = this.keycloakHttpClient.post()
                                .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}/members",
                                                realm, organizationId)
                                .headers(headers -> headers.setBearerAuth(accessToken))
                                .bodyValue(userId)
                                .retrieve()
                                .toEntity(String.class)
                                .block();

                if (response == null || response.getStatusCode().isError()) {
                        throw new RuntimeException("Failed to add user as member to organization");
                }
        }

        private void addMemberToOrganizationGroup(String accessToken, String organizationId, String groupId,
                        String userId) {

                addUserAsMemberToOrganization(accessToken, organizationId, userId);

                this.keycloakHttpClient.put()
                                .uri(this.origin
                                                + "/admin/realms/{realm}/organizations/{organizationId}/groups/{groupId}/members/{userId}",
                                                realm, organizationId, groupId, userId)
                                .headers(headers -> headers.setBearerAuth(accessToken))
                                .retrieve()
                                .onStatus(HttpStatusCode::is4xxClientError, response -> response
                                                .bodyToMono(String.class)
                                                .flatMap(body -> Mono.error(
                                                                new RuntimeException(
                                                                                "Client Error adding member to group: "
                                                                                                + body))))
                                .onStatus(HttpStatusCode::is5xxServerError, response -> response
                                                .bodyToMono(String.class)
                                                .flatMap(body -> Mono.error(
                                                                new RuntimeException(
                                                                                "Server Error adding member to group: "
                                                                                                + body))))
                                .toBodilessEntity()
                                .block();
        }

        private void addMemberToOrganization(String accessToken, String organizationId, String userId) {
                this.keycloakHttpClient.put()
                                .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}/members/{userId}",
                                                realm, organizationId, userId)
                                .headers(headers -> headers.setBearerAuth(accessToken))
                                .retrieve()
                                .onStatus(HttpStatusCode::is4xxClientError, response -> response
                                                .bodyToMono(String.class)
                                                .flatMap(body -> Mono.error(
                                                                new RuntimeException(
                                                                                "Client Error adding member to organization: "
                                                                                                + body))))
                                .onStatus(HttpStatusCode::is5xxServerError, response -> response
                                                .bodyToMono(String.class)
                                                .flatMap(body -> Mono.error(
                                                                new RuntimeException(
                                                                                "Server Error adding member to organization: "
                                                                                                + body))))
                                .toBodilessEntity()
                                .block();
        }

        @Override
        public ResponseEntity<String> removeEmployeeFromOrganization(String organizationId, String groupId,
                        String userId) {
                try {
                        String accessToken = getAdminAccessToken();
                        this.keycloakHttpClient.delete()
                                        .uri(this.origin + "/admin/realms/{realm}/organizations/{org-id}/groups/{group-id}/members/{userId}",
                                                        realm, organizationId, groupId, userId)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();

                        this.keycloakHttpClient.delete()
                                        .uri(this.origin + "/admin/realms/{realm}/users/{userId}", realm, userId)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();
                        return ResponseEntity.ok("Employee removed from organization");
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body("Error removing employee from organization: " + e.getMessage());
                }
        }

        private String getAdminAccessToken() {
                KeycloakTokenResponse tokenResponse = this.keycloakHttpClient.post()
                                .uri(this.origin + "/realms/{realm}/protocol/openid-connect/token", realm)
                                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                                .body(BodyInserters.fromFormData("grant_type", "client_credentials")
                                                .with("client_id", clientId)
                                                .with("client_secret", secret))
                                .retrieve()
                                .bodyToMono(KeycloakTokenResponse.class)
                                .block();

                if (tokenResponse == null || tokenResponse.access_token() == null
                                || tokenResponse.access_token().isBlank()) {
                        throw new RuntimeException("Unable to obtain Keycloak access token");
                }

                return tokenResponse.access_token();
        }

        // new methods for creating an organization

        @Override
        public ResponseEntity<String> createEmptyOrganization(EmptyOrg_DTO emptyOrgData) {

                String accessToken = getAdminAccessToken();

                ResponseEntity<String> createResponse = this.keycloakHttpClient.post()
                                .uri(this.origin + "/admin/realms/{realm}/organizations", realm)
                                .headers(headers -> headers.setBearerAuth(accessToken))
                                .bodyValue(emptyOrgData)
                                .retrieve()
                                .onStatus(HttpStatusCode::is4xxClientError, response -> response
                                                .bodyToMono(String.class)
                                                .flatMap(body -> Mono.error(
                                                                new RuntimeException("Client Error: " + body))))
                                .onStatus(HttpStatusCode::is5xxServerError, response -> response
                                                .bodyToMono(String.class)
                                                .flatMap(body -> Mono.error(
                                                                new RuntimeException("Server Error: " + body))))
                                .toEntity(String.class)
                                .block();

                if (createResponse == null) {
                        throw new RuntimeException("Failed to create empty organization");
                }

                return new ResponseEntity<>(extractResourceId(createResponse), createResponse.getStatusCode());

        }

        @Override
        public ResponseEntity<List<GroupRepresentation_DTO>> createDefaultOrganizationGroups(String orgId) {

                String accessToken = getAdminAccessToken();

                String[] defaultGroups = { "Owner", "Manager", "Employee", "Customer" };

                List<GroupRepresentation_DTO> groupResponseDataCollection = new ArrayList<>();

                for (String groupName : defaultGroups) {
                        ResponseEntity<String> groupResponse = this.keycloakHttpClient.post()
                                        .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}/groups",
                                                        realm,
                                                        orgId)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .bodyValue(new GroupRepresentation_DTO(null, groupName))
                                        .retrieve()
                                        .onStatus(HttpStatusCode::is4xxClientError, response -> response
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException(
                                                                                        "Client Error creating group '"
                                                                                                        + groupName
                                                                                                        + "': "
                                                                                                        + body))))
                                        .onStatus(HttpStatusCode::is5xxServerError, response -> response
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException(
                                                                                        "Server Error creating group '"
                                                                                                        + groupName
                                                                                                        + "': "
                                                                                                        + body))))
                                        .toEntity(String.class)
                                        .block();

                        if (groupResponse == null) {
                                throw new RuntimeException("Failed to create group '" + groupName + "'");
                        }

                        String groupId = extractResourceId(groupResponse);
                        groupResponseDataCollection.add(new GroupRepresentation_DTO(groupId, groupName));

                }

                return ResponseEntity.ok(groupResponseDataCollection);
        }

        @Override
        public ResponseEntity<String> addOrganizationAddresses(String organizationId, List<Address_DTO> addressData) {

                try {

                        List<Address> addressCollection = new ArrayList<>();

                        for (Address_DTO address_dto : addressData) {
                                Address address = new Address();
                                address.setAddressName(address_dto.addressName());
                                address.setStreetLine1(address_dto.streetLine1());
                                address.setStreetLine2(address_dto.streetLine2());
                                address.setCity(address_dto.city());
                                address.setCounty(address_dto.county());
                                address.setPostalCode(address_dto.postalCode());
                                address.setCountry(address_dto.country());
                                address.setBillingAddress(address_dto.isBillingAddress());

                                // Set the organization for the address before adding it to the collection
                                Organization organization = orgRepo.findById(organizationId)
                                                .orElseThrow(() -> new RuntimeException(
                                                                "Organization not found with id: " + organizationId));
                                address.setOrganization(organization);

                                addressCollection.add(address);
                        }

                        // Save all addresses to the repository
                        return ResponseEntity.ok(addressRepo.saveAll(addressCollection).toString());

                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body("Error adding organization addresses: " + e.getMessage());
                }

                // TODO Auto-generated method stub
                // throw new UnsupportedOperationException("Unimplemented method
                // 'addOrganizationAddresses'");
        }

        @Override
        public ResponseEntity<String> createUsers(List<UserRepresentation_DTO> users) {

                String accessToken = getAdminAccessToken();

                for (UserRepresentation_DTO user : users) {
                        ResponseEntity<String> response = this.keycloakHttpClient.post()
                                        .uri(this.origin + "/admin/realms/{realm}/users", realm)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .bodyValue(user)
                                        .retrieve()
                                        .onStatus(HttpStatusCode::is4xxClientError, response1 -> response1
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException("Client Error: " + body))))
                                        .onStatus(HttpStatusCode::is5xxServerError, response1 -> response1
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException("Server Error: " + body))))
                                        .toEntity(String.class)
                                        .block();

                        if (response == null) {
                                throw new RuntimeException("Failed to create user: " + response.getBody());
                        }                        
                }

                return ResponseEntity.ok("Users created successfully");

                // TODO Auto-generated method stub
                // throw new UnsupportedOperationException("Unimplemented method 'createUsers'");
        }

        @Override
        public ResponseEntity<String> assignUsersToAddresses(List<UserAddressAssignment_DTO> assignments) {
                
                for (UserAddressAssignment_DTO assignment : assignments) {
                        User user = userRepo.findById(assignment.userId())
                                        .orElseThrow(() -> new RuntimeException("User not found: " + assignment.userId()));
                        user.setAddress(
                                addressRepo.findById(UUID.fromString(assignment.addressId()))
                                        .orElseThrow(() -> new RuntimeException("Address not found: " + assignment.addressId()))
                        );
                        userRepo.save(user);
                }

                return ResponseEntity.ok("Users assigned to addresses successfully");
        }

        @Override
        public ResponseEntity<String> assignUsersAsMembers(String organizationId, List<String> userIds) {
                
                String accessToken = getAdminAccessToken();

                for (String userId : userIds) {
                        
                        ResponseEntity<String> response = this.keycloakHttpClient.put()
                                        .uri(this.origin + "/admin/realms/{realm}/users", realm)
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .bodyValue(userId)
                                        .retrieve()
                                        .onStatus(HttpStatusCode::is4xxClientError, response1 -> response1
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException("Client Error: " + body))))
                                        .onStatus(HttpStatusCode::is5xxServerError, response1 -> response1
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException("Server Error: " + body))))
                                        .toEntity(String.class)
                                        .block();

                        if (response == null) {
                                throw new RuntimeException("Failed to create user: " + response.getBody());
                        }                       
                }

                return ResponseEntity.ok("Users assigned as members successfully.");

                // TODO Auto-generated method stub
                // throw new UnsupportedOperationException("Unimplemented method 'assignUsersAsMembers'");
        }

        @Override
        public ResponseEntity<String> assignUsersAsMembersToGroups(String organizationId,
                        List<UserGroupAssignment_DTO> assignments) {
                
                String accessToken = getAdminAccessToken();

                for (UserGroupAssignment_DTO assignment : assignments) {
                        ResponseEntity<String> response = this.keycloakHttpClient.put()
                                        .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}/groups/{groupId}/members/{userId}", realm, organizationId, assignment.groupId(), assignment.userId())
                                        .headers(headers -> headers.setBearerAuth(accessToken))
                                        .retrieve()
                                        .onStatus(HttpStatusCode::is4xxClientError, response1 -> response1
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException("Client Error: " + body))))
                                        .onStatus(HttpStatusCode::is5xxServerError, response1 -> response1
                                                        .bodyToMono(String.class)
                                                        .flatMap(body -> Mono.error(
                                                                        new RuntimeException("Server Error: " + body))))
                                        .toEntity(String.class)
                                        .block();
                        if (response == null) {
                                throw new RuntimeException("Failed to assign user to group: " + assignment.userId());
                        }
                }
                
                return ResponseEntity.ok("Users assigned to groups successfully.");

                // TODO Auto-generated method stub
                // throw new UnsupportedOperationException("Unimplemented method 'assignUsersAsMembersToGroups'");
        }
}
