package com.web.app.swift_booking.dto.Keycloak;

import java.util.UUID;

public record MemberRepresentation_DTO(
    String id,
    String username,
    String email,
    String firstName,
    String lastName,
    boolean enabled,
    boolean emailVerified,
    UUID addressId,
    String groupName
) {
    
}
