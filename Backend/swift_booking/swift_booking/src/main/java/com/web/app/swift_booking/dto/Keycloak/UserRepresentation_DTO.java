package com.web.app.swift_booking.dto.Keycloak;
import java.util.List;

public record UserRepresentation_DTO(
    String id,
    String username,
    String email,
    String firstName,
    String lastName,
    boolean enabled,
    boolean emailVerified,
    List<CredentialRepresentation_DTO> credentials,
    List<String> requiredActions,
    List<String> realmRoles

) {
    
}
