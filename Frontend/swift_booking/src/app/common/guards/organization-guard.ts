import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment.local';

@Injectable({
  providedIn: 'root',
})
export class OrganizationGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly httpClient: HttpClient,
    private readonly router: Router,
  ) {}

  async canActivate(): Promise<boolean> {
    await this.authService.refreshUserProfile();
    const profile = await firstValueFrom(this.authService.userProfile$);
    const userId = profile?.id || '';

   

    /*if (!userId) {
      await this.router.navigate(['/login-choice-member-only']);
      return false;
    }*/

    try {
      let org: SimpleOrgDetail = { id: '', name: '' };
      await firstValueFrom(
        this.httpClient.get<SimpleOrgDetail[]>(
          `${environment.apiBaseUrl}/api/organizations/small-info/${userId}`,
        )
      ).then((data) => {
        org = data[0];
      });

      if (org.name === '') {
        await this.router.navigate(['/create-organization']);
        return false;
      }

      return true;
    } catch (error) {
      console.error('OrganizationGuard: failed to load organization', error);
      await this.router.navigate(['/create-organization']);
      return false;
    }
  }
}

interface SimpleOrgDetail {
  id?: string;
  name?: string;
}