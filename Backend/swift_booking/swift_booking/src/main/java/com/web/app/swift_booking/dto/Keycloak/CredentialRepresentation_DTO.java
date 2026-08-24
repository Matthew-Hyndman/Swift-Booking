package com.web.app.swift_booking.DTO.Keycloak;
import java.util.Optional;

public record CredentialRepresentation_DTO(
    Optional<String> id,
    String type,
    Optional<String> userLabel,
    Optional<Long> createdDate,
    Optional<String> credentialData,
    Optional<Integer> priority,
    String value,
    boolean temporary,
    Optional<Integer> period

) {
    
}
