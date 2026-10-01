import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth';

type AppRole = 'Owner' | 'Manager' | 'Employee';

interface OrganizationViewModel {
  organizationName: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  branches: Array<{
    name: string;
    city: string;
    staffCount: number;
  }>;
  staff: Array<{
    name: string;
    role: string;
    branch: string;
  }>;
  analytics: {
    activeBookings: number;
    monthlyRevenue: string;
    cancellationRate: string;
  };
}

@Component({
  selector: 'app-manage-organization',
  standalone: false,
  templateUrl: './manage-organization.html',
  styleUrl: './manage-organization.scss',
})
export class ManageOrganization implements OnInit, OnDestroy {
  currentUserRoles: AppRole[] = [];
  currentUserGroups: string[] = [];

  private authSubscription: Subscription | null = null;

  constructor(private authService: AuthService) {}

  readonly sectionAuthorization: Record<string, AppRole> = {
    organizationName: 'Employee',
    billingAddress: 'Owner',
    branches: 'Employee',
    staff: 'Employee',
    analytics: 'Owner',
  };

  readonly organization: OrganizationViewModel = {
    organizationName: 'Swift Booking Group',
    billingAddress: {
      line1: '145 Grand Harbor Ave',
      line2: 'Suite 210',
      city: 'Cape Town',
      region: 'Western Cape',
      postalCode: '8001',
      country: 'South Africa',
    },
    branches: [
      { name: 'City Center Branch', city: 'Cape Town', staffCount: 12 },
      { name: 'Waterfront Branch', city: 'Cape Town', staffCount: 8 },
      { name: 'Sandton Branch', city: 'Johannesburg', staffCount: 10 },
    ],
    staff: [
      { name: 'Aaliyah Daniels', role: 'Branch Supervisor', branch: 'City Center Branch' },
      { name: 'Kamo Mokoena', role: 'Travel Consultant', branch: 'Sandton Branch' },
      { name: 'Mia Petersen', role: 'Support Specialist', branch: 'Waterfront Branch' },
    ],
    analytics: {
      activeBookings: 146,
      monthlyRevenue: 'R 872,430',
      cancellationRate: '2.8%',
    },
  };

  ngOnInit(): void {
    this.updateAuthorizationFromGroups();

    this.authSubscription = this.authService.isLoggedIn$.subscribe(() => {
      this.updateAuthorizationFromGroups();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.authSubscription = null;
  }

  hasRole(role: AppRole): boolean {
    return this.currentUserRoles.includes(role);
  }

  canEditSection(): boolean {
    return this.hasRole('Manager');
  }

  onEditSection(sectionName: string): void {
    if (!this.canEditSection()) {
      return;
    }

    // Hook this into your modal or edit flow.
    console.log(`Editing section: ${sectionName}`);
  }

  onOpenSettings(): void {
    if (!this.hasRole('Owner')) {
      return;
    }

    // Hook this into owner settings route/panel.
    console.log('Opening organization settings...');
  }

  private updateAuthorizationFromGroups(): void {
    this.currentUserGroups = this.authService.getUserGroups();
    this.currentUserRoles = this.mapGroupsToAppRoles(this.currentUserGroups);
  }

  private mapGroupsToAppRoles(groupPaths: string[]): AppRole[] {
    const normalizedSegments = groupPaths
      .flatMap((groupPath) =>
        groupPath
          .toLowerCase()
          .split('/')
          .filter((segment) => !!segment.trim()),
      )
      .map((segment) => segment.trim());

    const roles: AppRole[] = [];

    if (normalizedSegments.includes('owner')) {
      roles.push('Owner');
    }

    if (normalizedSegments.includes('manager')) {
      roles.push('Manager');
    }

    if (normalizedSegments.includes('employee')) {
      roles.push('Employee');
    }

    return roles;
  }

}
