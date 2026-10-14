package com.web.app.swift_booking.dto.Keycloak;
import java.util.Optional;
public record EmptyOrg_DTO(

    Optional<String> id,
    String name,
    String alias,
    boolean enabled,
    String description,
    String redirectUrl

) {

}
