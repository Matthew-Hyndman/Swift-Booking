import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.local';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { 
    EmptyOrg,
    AddressRepresentation, 
    UserRepresentation, 
    UserAddressAssignment,
    UserGroupAssignment,
    SimpleGroupRepresentation
} from '../models/org-models';
import { inject } from '@angular/core/primitives/di';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CreateOrg {

    private http = inject(HttpClient);

    async createEmptyOrganization(org: EmptyOrg, token: string): Promise<string> {
        
        const orgId = await firstValueFrom(this.http.post<string>(
            `${environment.apiBaseUrl}/api/organizations/create-empty`, 
            org,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ));
        return orgId;
    }

    async createDefaultOrganizationGroups(orgId: string, token: string): Promise<Array<SimpleGroupRepresentation>> {
        const groups = await firstValueFrom(this.http.post<Array<SimpleGroupRepresentation>>(
            `${environment.apiBaseUrl}/api/organizations/create-default-groups/${orgId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ));
        return groups;
    }

    async addOrganizationAddresses(orgId: string, addresses: Array<AddressRepresentation>, token: string): Promise<Array<string>> {
        const addressIds = await firstValueFrom(this.http.post<Array<string>>(
            `${environment.apiBaseUrl}/api/organizations/${orgId}/addresses`,
            addresses,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ));
        return addressIds;
    }

    async createUsers(orgId: string, users: Array<UserRepresentation>, token: string): Promise<Array<UserRepresentation>> {
        const usersCreated = await firstValueFrom(this.http.post<Array<UserRepresentation>>(
            `${environment.apiBaseUrl}/api/organizations/${orgId}/users`,
            users,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ));
        return usersCreated;
    }

    async assignUsersToAddresses(assignments: Array<UserAddressAssignment>, token: string): Promise<void> {
        await firstValueFrom(this.http.post<void>(
            `${environment.apiBaseUrl}/api/organizations/assign-users-to-addresses`,
            assignments,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ));
    }

    async assignUsersAsMembers(orgId: string, users: Array<string>, token: string): Promise<void> {
        await firstValueFrom(this.http.post<void>(
            `${environment.apiBaseUrl}/api/organizations/${orgId}/assign-users-as-members`,
            users,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ));
    }

    async assignUsersToGroups(orgId: string, assignments: Array<UserGroupAssignment>, token: string): Promise<void> {
        await firstValueFrom(this.http.post<void>(
            `${environment.apiBaseUrl}/api/organizations/${orgId}/assign-users-to-groups`,
            assignments,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ));
    }
}


