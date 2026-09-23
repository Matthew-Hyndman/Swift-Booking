import { CanActivate } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export class OrganizationGuard implements CanActivate {
  
   org: SimpleOrgDetail = { id: '', name: '' };


  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private router: Router
  ) {}

  canActivate(): boolean {

     let userId = '';

     this.authService.userProfile$.subscribe(profile => {
       userId = profile?.id || '';
     });

    this.httpClient.get<SimpleOrgDetail>(`${environment.apiBaseUrl}/api/organizations/small-info/${userId}`).subscribe(org => {
      this.org = org;
    });

    if (this.org.id === '' || this.org.name === '') {
      this.router.navigate(['/create-organization']);
    } else {
      return true;
    }

  return false;
  }
}

interface SimpleOrgDetail {
  id?: string;
  name?: string;
}