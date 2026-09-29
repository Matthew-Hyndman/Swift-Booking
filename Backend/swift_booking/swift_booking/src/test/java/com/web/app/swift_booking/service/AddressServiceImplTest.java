package com.web.app.swift_booking.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.web.app.swift_booking.dto.Address_DTO;
import com.web.app.swift_booking.entity.Address;
import com.web.app.swift_booking.entity.Keycloak.Organization;

class AddressServiceImplTest {

    @Test
    void shouldMapTransactionalAddressDataToEntity() {
        Organization org = new Organization();
        org.setId("org-123");

        Address_DTO dto = new Address_DTO(
                UUID.randomUUID(),
                "HQ Branch",
                "12 Main Road",
                "Suite 2",
                "Johannesburg",
                "Gauteng",
                "2000",
                "South Africa",
                null,
                "org-123"
        );

        AddressService_Impl service = new AddressService_Impl(null, null);
        Address address = service.toAddressEntity(dto, org);

        assertNotNull(address);
        assertEquals("HQ Branch", address.getAddressName());
        assertEquals("12 Main Road", address.getStreetLine1());
        assertEquals("Suite 2", address.getStreetLine2());
        assertEquals("Johannesburg", address.getCity());
        assertEquals("Gauteng", address.getCounty());
        assertEquals("2000", address.getPostalCode());
        assertEquals("South Africa", address.getCountry());
        assertEquals("org-123", address.getOrganization().getId());
    }
}
