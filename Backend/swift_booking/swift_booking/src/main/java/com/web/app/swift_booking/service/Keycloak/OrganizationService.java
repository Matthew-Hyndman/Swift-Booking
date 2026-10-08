package com.web.app.swift_booking.service.Keycloak;
import java.util.Optional;
import java.util.List;
import org.springframework.http.ResponseEntity;
import com.web.app.swift_booking.dto.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.SimpleOrgDetail_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserRepresentation_DTO;
import com.web.app.swift_booking.dto.Address_DTO;
import com.web.app.swift_booking.dto.Keycloak.EmptyOrg_DTO;
import com.web.app.swift_booking.dto.Keycloak.GroupRepresentation_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserAddressAssignment_DTO;
import com.web.app.swift_booking.dto.Keycloak.UserGroupAssignment_DTO;
import com.web.app.swift_booking.entity.Keycloak.Organization;

public interface OrganizationService {
    
    // new create organization service methods

    ResponseEntity<String> createEmptyOrganization(EmptyOrg_DTO emptyOrgData);

    ResponseEntity<List<GroupRepresentation_DTO>> createDefaultOrganizationGroups(String orgId);

    ResponseEntity<String> addOrganizationAddresses(String organizationId, List<Address_DTO> addressData);

    ResponseEntity<String> createUsers(List<UserRepresentation_DTO> users);

    ResponseEntity<String> assignUsersToAddresses(List<UserAddressAssignment_DTO> assignments);

    ResponseEntity<String> assignUsersAsMembers(String organizationId, List<String> userIds);

     ResponseEntity<String> assignUsersAsMembersToGroups(String organizationId, List<UserGroupAssignment_DTO> assignments);

    // old create organization service methods

    /*ResponseEntity<String> createOrganization(String userId, OrganizationRepresentation_DTO organizationData);    

    Optional<Organization> getOrganizationById(String organizationId);*/

    List<SimpleOrgDetail_DTO> getSmallOrgInfo(String userId);

    /*String updateOrganization(String organizationId, OrganizationRepresentation_DTO organizationData);

    String deleteOrganization(String organizationId);*/

    ResponseEntity<String> addEmployeeToOrganization(String organizationId, String groupId, UserRepresentation_DTO userData);

    //ResponseEntity<String> removeEmployeeFromOrganization(String organizationId, String groupId, String userId);
}
