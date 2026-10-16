import { Component, inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { routes } from '../../../app-routing.module';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { OnInit } from '@angular/core';
import { OrganizationAndRoleModule } from '../../../common/classes/models/org-models';
import { CreateOrg } from '../../../common/classes/api/create-org'
import { environment } from '../../../../environments/environment.local';

@Component({
  selector: 'app-manage-organization',
  standalone: false,
  templateUrl: './manage-organization.html',
  styleUrl: './manage-organization.scss',
})
export class ManageOrganization implements OnInit {

  private readonly keycloak = inject(Keycloak);

  organizationAndRoles: OrganizationAndRoleModule | undefined;

  accessToken: string | null = null;

  testmode = environment.testMode;

  constructor(
    private readonly route: Router,
    private readonly auth: AuthService,
    private readonly createOrgApi: CreateOrg
    ) {}

  ngOnInit(): void {
    this.accessToken = this.keycloak.token ?? null;
    this.organizationAndRoles = this.auth.mapOrganizationAndRole().find(org => {
      return org.roles.includes('Owner') || 
             org.roles.includes('Manager') || 
             org.roles.includes('Employee');
    });
  }

  async deleteOrganization() {
    // Implement the logic to delete the organization here
    if (this.organizationAndRoles) {
      try {
        await this.createOrgApi.resetCreation(this.organizationAndRoles.organizationId, this.accessToken!);
        console.log('Organization deleted successfully');
        this.route.navigate(['/create-organization']);
      } catch (error) {
        console.error('Failed to delete organization', error);
      }
    }


  }
}
