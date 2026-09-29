package com.web.app.swift_booking.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record Address_DTO(
    UUID addressId,
    String addressName,
    String streetLine1,
    String streetLine2,
    String city,
    String county,
    String postalCode,
    String country,
    LocalDateTime createdAt,
    String organizationId
) { }
