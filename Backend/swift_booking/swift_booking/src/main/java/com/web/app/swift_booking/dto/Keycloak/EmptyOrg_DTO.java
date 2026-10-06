package com.web.app.swift_booking.dto.Keycloak;

public record EmptyOrg_DTO(
    String name,
    String alias,
    boolean enabled,
    String description,
    String redirectUri
) {

}
