package com.web.app.swift_booking.service.Keycloak;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import com.web.app.swift_booking.DTO.Keycloak.OrganizationRepresentation_DTO;
import com.web.app.swift_booking.DTO.Keycloak.UserRepresentation_DTO;
import com.web.app.swift_booking.entity.Keycloak.Organization;

public interface OrganizationService {
    
    ResponseEntity<String> createOrganization(String userId, OrganizationRepresentation_DTO organizationData);    

    Optional<Organization> getOrganizationById(String organizationId);

    String updateOrganization(String organizationId, OrganizationRepresentation_DTO organizationData);

    String deleteOrganization(String organizationId);

    ResponseEntity<String> addEmployeeToOrganization(String organizationId, String groupId, UserRepresentation_DTO userData);

    ResponseEntity<String> removeEmployeeFromOrganization(String organizationId, String groupId, String userId);
}
