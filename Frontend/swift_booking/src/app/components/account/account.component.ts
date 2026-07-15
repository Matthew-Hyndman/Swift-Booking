import { Component, OnInit } from '@angular/core';
import { AccountProfile, AccountService } from '../../services/account.service';

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  form: AccountProfile = {
    fullName: '',
    email: '',
    phone: '',
    businessName: ''
  };

  isEditing = false;
  message = '';
  error = '';

  constructor(private readonly accountService: AccountService) {}

  ngOnInit(): void {
    this.form = this.accountService.getProfile();
  }

  startEdit(): void {
    this.isEditing = true;
    this.message = '';
    this.error = '';
  }

  cancelEdit(): void {
    this.form = this.accountService.getProfile();
    this.isEditing = false;
  }

  save(): void {
    if (!this.form.fullName || !this.form.email || !this.form.businessName) {
      this.error = 'Name, email, and business name are required.';
      return;
    }

    this.accountService.saveProfile(this.form);
    this.message = 'Account profile updated.';
    this.error = '';
    this.isEditing = false;
  }

  deleteAccount(): void {
    this.accountService.deleteProfile();
    this.form = this.accountService.getProfile();
    this.isEditing = false;
    this.message = 'Account profile removed from this browser.';
    this.error = '';
  }
}
