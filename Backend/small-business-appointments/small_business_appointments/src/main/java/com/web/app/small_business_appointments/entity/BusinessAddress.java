package com.web.app.small_business_appointments.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "business_addresses")
@Getter
@Setter
@NoArgsConstructor
public class BusinessAddress {

    @EmbeddedId
    private BusinessAddressId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("businessId")
    @JoinColumn(name = "business_id")
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("addressId")
    @JoinColumn(name = "address_id")
    private Address address;
}
