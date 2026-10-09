export interface EmptyOrg {
    name: string,
    alias: string,
    enabled: boolean,
    description: string,
    redirectUri: string,
}

export interface AddressRepresentation {
    addressId?: string,
    addressName: string,
    streetLine1: string,
    streetLine2?: string,
    city: string,
    county: string,
    country: string,
    postalCode: string,
    createTime?: Date,
    organizationId?: string,
    isBillingAddress: boolean
    members?: Array<UserRepresentation>
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
    Roles?: Array<string> | string
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

export interface SimpleGroupRepresentation {
    groupId: string,
    name: string,
    description?: string
}

export interface UserGroupAssignment {
    userId: string,
    groupId: string
}

export interface OrganizationRepresentation {
    id?: string,
    name: string,
    alias: string,
    enabled: boolean,
    description: string,
    redirectUri: string,
    branches?: Array<AddressRepresentation>,
    users?: Array<UserRepresentation>
}