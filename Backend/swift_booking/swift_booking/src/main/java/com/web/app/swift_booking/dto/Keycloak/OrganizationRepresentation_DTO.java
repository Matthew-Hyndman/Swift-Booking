package com.web.app.swift_booking.DTO.Keycloak;

import java.util.List;

import lombok.Data;

@Data
public class OrganizationRepresentation_DTO {
    private String id;
    private String name;
    private String alias;
    private boolean enabled;
    private String description;
    private String redirectUrl;
    private List<MemberRepresentation_DTO> members;
    private List<GroupRepresentation_DTO> groups;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    public List<MemberRepresentation_DTO> getMembers() {
        return members;
    }

    public void setMembers(List<MemberRepresentation_DTO> members) {
        this.members = members;
    }

    public List<GroupRepresentation_DTO> getGroups() {
        return groups;
    }

    public void setGroups(List<GroupRepresentation_DTO> groups) {
        this.groups = groups;
    }
}
