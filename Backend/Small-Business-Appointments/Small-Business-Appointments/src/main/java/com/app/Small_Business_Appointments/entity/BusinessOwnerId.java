package com.web.app.small-business-appointments.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BusinessOwnerId implements Serializable {

    @Column(name = "business_id")
    private Integer businessId;

    @Column(name = "owner_id")
    private Integer ownerId;
}
