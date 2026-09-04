package com.web.app.swift_booking.service.Keycloak;

import org.springframework.http.ResponseEntity;
import java.util.List;

import com.web.app.swift_booking.dto.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.GroupRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.MemberRepresentation_DTO;
//import com.web.app.swift_booking.entity.Keycloak.Organization;

public interface OrganizationService {
    
    ResponseEntity<String> createOrganization(String userId, OrganizationRepresentation_DTO organizationData);    

    ResponseEntity<OrganizationRepresentation_DTO> getOrganizationById(String organizationId);

    ResponseEntity<List<MemberRepresentation_DTO>> getOrganizationMembersById(String organizationId);

    ResponseEntity<List<GroupRepresentation_DTO>> getOrganizationGroupsById(String organizationId);

    ResponseEntity<OrganizationRepresentation_DTO> getOrganizationByUserId(String ownerId);

    String updateOrganization(String organizationId, OrganizationRepresentation_DTO organizationData);

    String deleteOrganization(String organizationId);

    ResponseEntity<String> addEmployeeToOrganization(String organizationId, String groupId, UserRepresentation_DTO userData);

    ResponseEntity<String> removeEmployeeFromOrganization(String organizationId, String groupId, String userId);
}
