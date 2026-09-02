package com.web.app.swift_booking.entity.Keycloak;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "org")
@Getter
@Setter
public class Organization {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "alias")
    private String alias;

    @Column(name = "enabled")
    private Boolean enabled;

    @Column(name = "description")
    private String description;

    @Column(name = "redirect_url")
    private String redirectUrl;

}
