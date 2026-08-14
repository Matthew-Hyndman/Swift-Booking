package com.web.app.swift_booking.service.Keycloak;
import java.util.Optional;
import com.web.app.swift_booking.DTO.Keycloak.MemberRepresentation_DTO;
import com.web.app.swift_booking.DTO.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.entity.Keycloak.Organization;

public interface OrganizationService {
    
    String createOrganization(String userId, OrganizationRepresentation_DTO organizationData);    

    Optional<Organization> getOrganizationById(String organizationId);

    String updateOrganization(String organizationId, OrganizationRepresentation_DTO organizationData);

    String deleteOrganization(String organizationId);

    String addEmployeeToOrganization(String organizationId, String groupId, String userId);

    String removeEmployeeFromOrganization(String organizationId, String groupId, String userId);
}
