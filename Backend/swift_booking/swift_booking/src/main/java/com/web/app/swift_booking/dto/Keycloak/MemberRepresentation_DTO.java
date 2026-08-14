package com.web.app.swift_booking.DTO.Keycloak;

public record MemberRepresentation_DTO(
    String id,
    String username,
    String email,
    String firstName,
    String lastName,
    boolean enabled,
    boolean emailVerified    
) {
    
}
