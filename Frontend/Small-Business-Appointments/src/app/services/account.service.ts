import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AccountProfile {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private static readonly STORAGE_KEY = 'bookwise_account_profile';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  getProfile(): AccountProfile {
    if (!isPlatformBrowser(this.platformId)) {
      return this.defaultProfile();
    }

    const raw = window.localStorage.getItem(AccountService.STORAGE_KEY);
    if (!raw) {
      return this.defaultProfile();
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AccountProfile>;
      return {
        fullName: parsed.fullName ?? 'Account Owner',
        email: parsed.email ?? 'owner@bookwise.local',
        phone: parsed.phone ?? '',
        businessName: parsed.businessName ?? 'My Business'
      };
    } catch {
      return this.defaultProfile();
    }
  }

  saveProfile(profile: AccountProfile): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.localStorage.setItem(AccountService.STORAGE_KEY, JSON.stringify(profile));
  }

  deleteProfile(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.localStorage.removeItem(AccountService.STORAGE_KEY);
  }

  private defaultProfile(): AccountProfile {
    return {
      fullName: 'Account Owner',
      email: 'owner@bookwise.local',
      phone: '',
      businessName: 'My Business'
    };
  }
}
