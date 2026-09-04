package com.web.app.swift_booking.service.Keycloak;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.app.swift_booking.DAO.OrganizationRepo;
import com.web.app.swift_booking.DAO.UserRepo;
import com.web.app.swift_booking.dto.Keycloak.GroupRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.MemberRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.GroupRepresentation_DTO;
import com.web.app.swift_booking.entity.Keycloak.User;

import com.web.app.swift_booking.common.InvalidServerResponse;

import reactor.core.publisher.Mono;

@Service
public class OrganizationService_Impl implements OrganizationService {

        private record KeycloakTokenResponse(String access_token) {
        }

        private final UserRepo userRepo;

        private OrganizationRepo orgRepo;

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

        OrganizationService_Impl(UserRepo userRepo, OrganizationRepo orgRepo) {
                this.userRepo = userRepo;
                this.orgRepo = orgRepo;
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

                        String organizationId = extractResourceId(createResponse);
                        if (organizationId == null || organizationId.isBlank()) {
                                throw new RuntimeException(
                                                "Organization created but could not resolve organization ID from Keycloak response");
                        }

                        List<String> defaultGroupNames = List.of("Owner", "Manager", "Employee", "Customer");
                        String ownerGroupId = null;
                        for (String groupName : defaultGroupNames) {
                                String groupId = createOrganizationGroup(accessToken, organizationId, groupName);
                                if ("Owner".equals(groupName)) {
                                        ownerGroupId = groupId;
                                }
                        }

                        if (ownerGroupId != null && !ownerGroupId.isBlank()) {
                                addMemberToOrganizationGroup(accessToken, organizationId, ownerGroupId, user.getId());
                        } else {
                                addMemberToOrganization(accessToken, organizationId, user.getId());
                        }

                        String responseMessage = "Organization created, default groups added, and owner member assigned";
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
        public Mono<OrganizationRepresentation_DTO> getOrganizationById(String organizationId) {
                Mono<OrganizationRepresentation_DTO> orgMono = this.keycloakHttpClient
                                .get()
                                .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}",
                                                realm, organizationId)
                                .headers(headers -> headers.setBearerAuth(getAdminAccessToken()))
                                .retrieve()
                                .onStatus(HttpStatusCode::isError, resp -> resp.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .flatMap(body -> Mono.error(new InvalidServerResponse(
                                                                "getOrganizationById(\"" + organizationId + "\")",
                                                                "Upstream error: " + resp.statusCode() + " " + body))))
                                .bodyToMono(OrganizationRepresentation_DTO.class)
                                .switchIfEmpty(Mono.error(new InvalidServerResponse(
                                                "getOrganizationById(\"" + organizationId + "\")",
                                                "Organization not found")));

                Mono<List<MemberRepresentation_DTO>> membersMono = getOrganizationMembersById(organizationId);
                Mono<List<GroupRepresentation_DTO>> groupsMono = getOrganizationGroupsById(organizationId);

                return Mono.zip(orgMono, membersMono, groupsMono)
                                .map(tuple -> {
                                        OrganizationRepresentation_DTO org = tuple.getT1();
                                        org.setMembers(tuple.getT2());
                                        org.setGroups(tuple.getT3());
                                        return org;
                                });
        }

        @Override
        public Mono<List<MemberRepresentation_DTO>> getOrganizationMembersById(String organizationId) {
                return keycloakHttpClient.get()
                                .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}/members",
                                                realm, organizationId)
                                .headers(h -> h.setBearerAuth(getAdminAccessToken()))
                                .retrieve()
                                .onStatus(HttpStatusCode::isError, resp -> resp.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .flatMap(body -> Mono.error(new InvalidServerResponse(
                                                                "getOrganizationMembersById(\"" + organizationId
                                                                                + "\")",
                                                                "Upstream error: " + resp.statusCode() + " " + body))))
                                .bodyToFlux(MemberRepresentation_DTO.class)
                                .collectList();
        }

        @Override
        public Mono<List<GroupRepresentation_DTO>> getOrganizationGroupsById(String organizationId) {
                return keycloakHttpClient.get()
                                .uri(this.origin + "/admin/realms/{realm}/organizations/{organizationId}/groups", realm,
                                                organizationId)
                                .headers(h -> h.setBearerAuth(getAdminAccessToken()))
                                .retrieve()
                                .onStatus(HttpStatusCode::isError, resp -> resp.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .flatMap(body -> Mono.error(new InvalidServerResponse(
                                                                "getOrganizationGroupsById(\"" + organizationId + "\")",
                                                                "Upstream error: " + resp.statusCode() + " " + body))))
                                .bodyToFlux(GroupRepresentation_DTO.class)
                                .collectList();
        }

        @Override
        public ResponseEntity<OrganizationRepresentation_DTO> getOrganizationByUserId(String ownerId) {
                try {
                        ResponseEntity<List<OrganizationRepresentation_DTO>> responseOrgInfo = this.keycloakHttpClient
                                        .get()
                                        .uri(this.origin + "/admin/realms/{realm}/organizations/members/{memberId}/organizations",
                                                        realm, ownerId)
                                        .headers(headers -> headers.setBearerAuth(getAdminAccessToken()))
                                        .retrieve()
                                        .toEntityList(OrganizationRepresentation_DTO.class)
                                        .block();

                        if (responseOrgInfo == null || responseOrgInfo.getBody() == null) {
                                throw new InvalidServerResponse("getOrganizationByUserId(\"" + ownerId + "\")",
                                                "Organization response from server was empty");
                        }

                        if (responseOrgInfo.getBody().size() == 1) {
                                OrganizationRepresentation_DTO orgRep = responseOrgInfo.getBody().get(0);
                                return ResponseEntity.ok(orgRep);
                        } else if (responseOrgInfo.getBody().size() > 1) {
                                throw new InvalidServerResponse("getOrganizationByUserId(\"" + ownerId + "\")",
                                                "user is a member of more than one organization");

                        } else {
                                throw new InvalidServerResponse("getOrganizationByUserId(\"" + ownerId + "\")",
                                                "user is not a member of any organization");
                        }
                } catch (RuntimeException e) {
                        System.out.println(e.toString());
                        return ResponseEntity.status(500).body(null);
                }

        }

        // not implemented yet
        @Override
        public String updateOrganization(String organizationId, OrganizationRepresentation_DTO organizationData) {
                // Implementation here
                return null;
        }

        // not implemented yet
        @Override
        public String deleteOrganization(String organizationId) {
                // Implementation here
                return null;
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
}
