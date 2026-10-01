import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import Keycloak from 'keycloak-js';
import { environment } from '../../../../environments/environment.local';

@Component({
  selector: 'app-create-organization',
  standalone: false,
  templateUrl: './create-organization.html',
  styleUrl: './create-organization.scss',
})
export class CreateOrganization {
  private readonly fb = new FormBuilder();
  private readonly http = inject(HttpClient);
  private readonly keycloak = inject(Keycloak);
  private nextBranchId = 1;
  private nextStaffId = 1;

  readonly roleOptions: { value: string; label: string }[] = [
    { value: 'employee', label: 'employee' },
    { value: 'manger', label: 'Manger' },
    { value: 'owner', label: 'Owner' },
  ];

  readonly organizationForm = this.fb.group(
    {
      businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      billingAddress: this.createAddressGroup(),
      billingAddressIsWorkingBranch: [false],
      isUserStaffMemberAtBillingAddress: [false],
      billingStaffMembers: this.fb.array([]),
      disableAdditionalBranches: [false],
      branches: this.fb.array([this.createBranchGroup()]),
    },
    { validators: [this.onlyOneSignedInUserBranchValidator(), this.billingBranchMustHaveStaffMemberValidator()] },
  );

  submitted = false;
  billingStaffOpen = true;
  submittedPayload: unknown = null;
  branchAccordionState: BranchAccordionState[] = [this.createBranchAccordionState(1)];

  private readonly branchLeaving = new Set<number>();
  private readonly staffLeaving = new Set<string>();
  private readonly branchExitDurationMs = 260;
  private readonly staffExitDurationMs = 220;

  get branches(): FormArray<FormGroup> {
    return this.organizationForm.get('branches') as FormArray<FormGroup>;
  }

  get billingStaffMembers(): FormArray<FormGroup> {
    return this.organizationForm.get('billingStaffMembers') as FormArray<FormGroup>;
  }

  branchEmployees(index: number): FormArray<FormGroup> {
    return this.branches.at(index).get('employees') as FormArray<FormGroup>;
  }

  addBillingStaffMember(): void {
    this.billingStaffMembers.push(this.createEmployeeGroup());
    this.organizationForm.updateValueAndValidity();
  }

  removeBillingStaffMember(index: number): void {
    const isUserStaffMemberAtBillingAddress = this.organizationForm.get('isUserStaffMemberAtBillingAddress')?.value ?? false;
    if (this.billingStaffMembers.length === 1 && 
      !isUserStaffMemberAtBillingAddress) {
      return;
    }

    this.billingStaffMembers.removeAt(index);
    this.organizationForm.updateValueAndValidity();
  }

  addBranch(): void {
    const isBillingBranch = !!this.organizationForm.get('billingAddressIsWorkingBranch')?.value;
    const disableAdditionalBranches = !!this.organizationForm.get('disableAdditionalBranches')?.value;

    if (isBillingBranch && disableAdditionalBranches) {
      return;
    }

    this.branches.push(this.createBranchGroup());
    this.branchAccordionState.push(this.createBranchAccordionState(1));
  }

  removeBranch(index: number): void {
    if (this.branches.length === 1) {
      return;
    }

    const state = this.branchAccordionState[index];
    if (!state) {
      return;
    }

    this.branchLeaving.add(state.id);

    window.setTimeout(() => {
      const targetIndex = this.branchAccordionState.findIndex((branchState) => branchState.id === state.id);
      if (targetIndex === -1 || this.branches.length <= 1) {
        this.branchLeaving.delete(state.id);
        return;
      }

      this.branches.removeAt(targetIndex);
      this.branchAccordionState.splice(targetIndex, 1);
      this.clearStaffLeavingForBranch(state.id);
      this.branchLeaving.delete(state.id);
    }, this.branchExitDurationMs);
  }

  addEmployee(branchIndex: number): void {
    this.branchEmployees(branchIndex).push(this.createEmployeeGroup());
    this.branchAccordionState[branchIndex].staffMemberPanelsOpen.push(true);
    this.branchAccordionState[branchIndex].staffMemberIds.push(this.nextStaffId++);
    this.branches.at(branchIndex).updateValueAndValidity();
  }

  removeEmployee(branchIndex: number, employeeIndex: number): void {
    const employees = this.branchEmployees(branchIndex);
    const signedInUserIsStaffMember = !!this.branches.at(branchIndex).get('signedInUserIsStaffMember')?.value;

    if (employees.length === 1 && !signedInUserIsStaffMember) {
      return;
    }

    const state = this.branchAccordionState[branchIndex];
    const staffId = state?.staffMemberIds[employeeIndex];
    if (!state || staffId === undefined) {
      return;
    }

    const staffKey = this.staffKey(state.id, staffId);
    this.staffLeaving.add(staffKey);

    window.setTimeout(() => {
      const latestBranchIndex = this.branchAccordionState.findIndex((branchState) => branchState.id === state.id);
      if (latestBranchIndex === -1) {
        this.staffLeaving.delete(staffKey);
        return;
      }

      const latestState = this.branchAccordionState[latestBranchIndex];
      const latestEmployeeIndex = latestState.staffMemberIds.indexOf(staffId);
      if (latestEmployeeIndex === -1) {
        this.staffLeaving.delete(staffKey);
        return;
      }

      const latestEmployees = this.branchEmployees(latestBranchIndex);
      const latestSignedInUserIsStaffMember = !!this.branches
        .at(latestBranchIndex)
        .get('signedInUserIsStaffMember')?.value;

      if (latestEmployees.length <= 1 && !latestSignedInUserIsStaffMember) {
        this.staffLeaving.delete(staffKey);
        return;
      }

      latestEmployees.removeAt(latestEmployeeIndex);
      latestState.staffMemberPanelsOpen.splice(latestEmployeeIndex, 1);
      latestState.staffMemberIds.splice(latestEmployeeIndex, 1);
      this.branches.at(latestBranchIndex).updateValueAndValidity();
      this.staffLeaving.delete(staffKey);
    }, this.staffExitDurationMs);
  }

  branchTrackBy(index: number): number {
    return this.branchAccordionState[index]?.id ?? index;
  }

  isBranchRemoving(branchIndex: number): boolean {
    const id = this.branchAccordionState[branchIndex]?.id;
    return id !== undefined ? this.branchLeaving.has(id) : false;
  }

  isStaffRemoving(branchIndex: number, employeeIndex: number): boolean {
    const branchId = this.branchAccordionState[branchIndex]?.id;
    const staffId = this.branchAccordionState[branchIndex]?.staffMemberIds[employeeIndex];

    if (branchId === undefined || staffId === undefined) {
      return false;
    }

    return this.staffLeaving.has(this.staffKey(branchId, staffId));
  }

  toggleBranchDetails(branchIndex: number): void {
    const state = this.branchAccordionState[branchIndex];
    state.detailsOpen = !state.detailsOpen;
  }

  toggleBranchStaff(branchIndex: number): void {
    const state = this.branchAccordionState[branchIndex];
    state.staffOpen = !state.staffOpen;
  }

  toggleStaffMember(branchIndex: number, employeeIndex: number): void {
    const state = this.branchAccordionState[branchIndex];
    state.staffMemberPanelsOpen[employeeIndex] = !state.staffMemberPanelsOpen[employeeIndex];
  }

  isBranchDetailsOpen(branchIndex: number): boolean {
    return this.branchAccordionState[branchIndex]?.detailsOpen ?? false;
  }

  isBranchStaffOpen(branchIndex: number): boolean {
    return this.branchAccordionState[branchIndex]?.staffOpen ?? false;
  }

  isStaffMemberOpen(branchIndex: number, employeeIndex: number): boolean {
    return this.branchAccordionState[branchIndex]?.staffMemberPanelsOpen[employeeIndex] ?? false;
  }

  isOnlyBranch(): boolean {
    return this.branches.length === 1;
  }

  canAddBranch(): boolean {
    return !(
      !!this.organizationForm.get('billingAddressIsWorkingBranch')?.value &&
      !!this.organizationForm.get('disableAdditionalBranches')?.value
    );
  }

  onSignedInUserBranchSelected(branchIndex: number, isChecked: boolean): void {
    if (!isChecked) {
      return;
    }

    this.branches.controls.forEach((branchControl, index) => {
      if (index !== branchIndex) {
        branchControl.get('signedInUserIsStaffMember')?.setValue(false, { emitEvent: false });
      }
    });

    const billingStaffControl = this.organizationForm.get('isUserStaffMemberAtBillingAddress');
    if (billingStaffControl?.value) {
      billingStaffControl.setValue(false, { emitEvent: false });
    }
  }

  onBillingUserStaffMemberSelected(isChecked: boolean): void {
    if (!isChecked) {
      return;
    }

    this.branches.controls.forEach((branchControl) => {
      branchControl.get('signedInUserIsStaffMember')?.setValue(false, { emitEvent: false });
    });
  }

  isOnlyStaffMember(branchIndex: number): boolean {
    const signedInUserIsStaffMember = !!this.branches.at(branchIndex).get('signedInUserIsStaffMember')?.value;
    return this.branchEmployees(branchIndex).length === 1 && !signedInUserIsStaffMember;
  }

  isOnlyBillingStaffMember(): boolean {
    const isUserStaffMemberAtBillingAddress = this.organizationForm.get('isUserStaffMemberAtBillingAddress')?.value ?? false;
    return this.billingStaffMembers.length < 0 || !isUserStaffMemberAtBillingAddress;
  }

  getAddressSummary(branchIndex: number): string {
    const address = this.branches.at(branchIndex).get('address')?.value as AddressSummary | null;
    if (!address) {
      return '';
    }

    return [
      address.street1,
      address.street2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ]
      .map((part) => (part ?? '').trim())
      .filter((part) => part.length > 0)
      .join(', ');
  }

  getStaffCount(branchIndex: number): number {
    return this.branchEmployees(branchIndex).length;
  }

  onSubmit(): void {
    this.submitted = true;
    this.organizationForm.markAllAsTouched();

    if (this.organizationForm.invalid) {
      return;
    }

    const userId = this.keycloak.tokenParsed?.sub ?? this.keycloak.subject ?? '';
    if (!userId) {
      console.error('No signed-in user ID available for organization creation');
      return;
    }

    const payload = this.buildOrganizationPayload();
    this.submittedPayload = payload;

    this.http.post<string>(`${environment.apiBaseUrl}/api/organizations/create/${userId}`, payload).subscribe({
      next: (response) => {
        console.log('Organization created successfully', response);
        this.submittedPayload = {
          payload,
          response,
        };
      },
      error: (error) => {
        const message = error?.error ?? error?.message ?? 'Unable to create organization.';
        console.error('Organization creation failed', error);
        this.submittedPayload = {
          payload,
          error: message,
        };
      },
    });
  }

  hasError(control: AbstractControl | null, code: string): boolean {
    if (!control) {
      return false;
    }

    return control.hasError(code) && (control.touched || this.submitted);
  }

  private createAddressGroup(): FormGroup {
    return this.fb.group({
      addressName: ['', [Validators.required, Validators.maxLength(120)]],
      street1: ['', [Validators.required, Validators.maxLength(120)]],
      street2: [''],
      city: ['', [Validators.required, Validators.maxLength(80)]],
      state: ['', [Validators.required, Validators.maxLength(80)]],
      postalCode: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9 -]{3,12}$')]],
      country: ['', [Validators.required, Validators.maxLength(80)]],
    });
  }

  private createBranchGroup(): FormGroup {
    return this.fb.group(
      {
        branchName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
        address: this.createAddressGroup(),
        employees: this.fb.array([this.createEmployeeGroup()]),
        signedInUserIsStaffMember: [false],
      },
      { validators: this.branchMustHaveEmployeeValidator() },
    );
  }

  private createEmployeeGroup(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'),
        ],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      role: ['employee', [Validators.required]],
    });
  }

  private branchMustHaveEmployeeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const employees = control.get('employees') as FormArray<FormControl> | null;
      const signedInUserIsStaffMember = !!control.get('signedInUserIsStaffMember')?.value;

      if (!employees || employees.length < 1) {
        return signedInUserIsStaffMember ? null : { noEmployees: true };
      }

      return null;
    };
  }

  private onlyOneSignedInUserBranchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const branches = control.get('branches') as FormArray | null;
      const billingAddressIsWorkingBranch = !!control.get('billingAddressIsWorkingBranch')?.value;
      const isUserStaffMemberAtBillingAddress = !!control.get('isUserStaffMemberAtBillingAddress')?.value;

      if (!branches || branches.length === 0) {
        if (billingAddressIsWorkingBranch && isUserStaffMemberAtBillingAddress) {
          return null;
        }
        return null;
      }

      let selectedBranchCount = 0;

      if (billingAddressIsWorkingBranch && isUserStaffMemberAtBillingAddress) {
        selectedBranchCount += 1;
      }

      for (const branchControl of branches.controls) {
        const isSelected = !!(branchControl as FormGroup).get('signedInUserIsStaffMember')?.value;
        if (isSelected) {
          selectedBranchCount += 1;
        }
      }

      return selectedBranchCount > 1 ? { signedInUserAssignedToMultipleBranches: true } : null;
    };
  }

  private billingBranchMustHaveStaffMemberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const billingAddressIsWorkingBranch = !!control.get('billingAddressIsWorkingBranch')?.value;
      const isUserStaffMemberAtBillingAddress = !!control.get('isUserStaffMemberAtBillingAddress')?.value;
      const billingStaffMembers = control.get('billingStaffMembers') as FormArray | null;

      if (!billingAddressIsWorkingBranch) {
        return null;
      }

      const hasBillingStaff = !!billingStaffMembers && billingStaffMembers.length > 0;

      return hasBillingStaff || isUserStaffMemberAtBillingAddress
        ? null
        : { billingBranchNoStaffMembers: true };
    };
  }

  private buildOrganizationPayload(): Record<string, unknown> {
    const formValue = this.organizationForm.getRawValue();
    const businessName = formValue.businessName ?? '';
    const tokenClaims = (this.keycloak.tokenParsed ?? {}) as Record<string, unknown>;
    const preferredUsername = typeof tokenClaims['preferred_username'] === 'string'
      ? tokenClaims['preferred_username']
      : 'signed-in user';

    return {
      id: undefined,
      name: businessName,
      alias: businessName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'organization',
      enabled: true,
      description: `Business created by ${preferredUsername}`,
      redirectUrl: '',
      billingAddress: formValue.billingAddress,
      billingAddressIsWorkingBranch: formValue.billingAddressIsWorkingBranch,
      isUserStaffMemberAtBillingAddress: formValue.isUserStaffMemberAtBillingAddress,
      billingStaffMembers: formValue.billingStaffMembers,
      disableAdditionalBranches: formValue.disableAdditionalBranches,
      branches: formValue.branches,
      members: [],
      groups: [],
    };
  }

  private createBranchAccordionState(employeeCount: number): BranchAccordionState {
    const staffMemberIds = Array.from({ length: employeeCount }, () => this.nextStaffId++);

    return {
      id: this.nextBranchId++,
      detailsOpen: true,
      staffOpen: true,
      staffMemberPanelsOpen: Array.from({ length: employeeCount }, () => true),
      staffMemberIds,
    };
  }

  private staffKey(branchId: number, staffId: number): string {
    return `${branchId}-${staffId}`;
  }

  private clearStaffLeavingForBranch(branchId: number): void {
    const prefix = `${branchId}-`;
    for (const key of this.staffLeaving) {
      if (key.startsWith(prefix)) {
        this.staffLeaving.delete(key);
      }
    }
  }

}

interface BranchAccordionState {
  id: number;
  detailsOpen: boolean;
  staffOpen: boolean;
  staffMemberPanelsOpen: boolean[];
  staffMemberIds: number[];
}

interface AddressSummary {
  addressName?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
