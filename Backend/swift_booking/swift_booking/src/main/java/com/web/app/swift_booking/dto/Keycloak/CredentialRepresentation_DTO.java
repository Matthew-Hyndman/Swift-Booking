package com.web.app.swift_booking.dto.Keycloak;

public record CredentialRepresentation_DTO(
    String id,
    String type,
    String userlabel,
    Long createdDate,
    String credentialData,
    int priority,
    String value,
    boolean temporary,
    int period

) {
    
}
