
export interface EmptyOrg {
    name: string,
    alias: string,
    enabled: boolean,
    description: string,
    redirectUri: string,
}

export interface OrganizationAddress {
    addressId?: string,
    addressName: string,
    streetLine1: string,
    streetLine2?: string,
    city: string,
    county: string,
    postalCode: string,
    createTime?: Date,
    organizationId?: string,
    isBillingAddress: boolean
}

export interface UserRepresentation {
    userId?: string,
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    enabled: boolean,
    emailVerified: boolean,
    credentials?: Array<CredentialRepresentation>,
    requiredActions?: Array<string>,
    realmRoles?: Array<string>
}

export interface CredentialRepresentation {
    id?: string,
    type: string,
    userlabel?: string,
    createDate?: Date,
    credentialData?: string,
    priority?: number,
    value: string,
    temporary: boolean,
    period?: number
}

export interface UserAddressAssignment {
    userId: string,
    addressId: string
}

export interface UserGroupAssignment {
    userId: string,
    groupId: string
}