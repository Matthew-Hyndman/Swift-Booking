export interface KeycloakTokenOrgData {
    org_groups: KeycloakTokenOrg_Groups[];
    organization: KeycloakTokenOrganization[];
}

export interface KeycloakTokenOrg_Groups {
    id: string;
}

export interface KeycloakTokenOrganization {
    groups: string[];
}