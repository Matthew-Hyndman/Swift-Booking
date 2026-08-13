package com.web.app.swift_booking.dto.Keycloak;
import java.util.List;

public record OrganizationRepresentation_DTO(
    String id,
    String name,
    String alias,
    boolean enabled,
    String description,
    String redirectUrl,
    List<MemberRepresentation_DTO> members,
    List<GroupRepresentation_DTO> groups
) {
}
