package com.web.app.swift_booking.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.web.app.swift_booking.entity.Keycloak.Organization;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
public class Address {

    @Id
    @Column(name = "address_id", nullable = false, updatable = false)
    private UUID addressId;

    @Column(name = "address_name", nullable = false)
    private String addressName;

    @Column(name = "street_line1", nullable = false)
    private String streetLine1;

    @Column(name = "street_line2")
    private String streetLine2;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "county")
    private String county;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "country", nullable = false)
    private String country;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", referencedColumnName = "id", nullable = false)
    private Organization organization;

    @PrePersist
    void prePersist() {
        if (addressId == null) {
            addressId = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
