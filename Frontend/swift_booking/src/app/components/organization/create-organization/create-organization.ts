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
import { CreateOrg } from '../../../common/classes/api/create-org';
import {
  EmptyOrg,
  AddressRepresentation,
  UserRepresentation,
  CredentialRepresentation,
  UserAddressAssignment,
  UserGroupAssignment,
  OrganizationRepresentation,
  SimpleGroupRepresentation
} from '../../../common/classes/models/org-models'
import Keycloak from 'keycloak-js';
import { environment } from '../../../../environments/environment.local';
import { AuthService } from '../../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-organization',
  standalone: false,
  templateUrl: './create-organization.html',
  styleUrl: './create-organization.scss',
})
export class CreateOrganization {

  constructor(
    private readonly auth: AuthService,
    private readonly createOrgApi: CreateOrg
  ) {}

  testMode = environment.testMode;
  /**
   * `FOR TESTING ONLY`
   * 
   * Fills the organization form with a billing address as the working 
   * branch and the user as a single staff member.
   */
  populateFormWithBillingAddressAsWorkingBranchAndUserAsSingleStaffMember() {
    this.organizationForm.patchValue({
      businessName: 'Test Business 1',
      billingAddress: {
        addressName: 'Billing Address',
        street1: '123 Main St',
        street2: '',
        city: 'City',
        county: 'County',
        postalCode: '12345',
        country: 'Country',
      },
      billingAddressIsWorkingBranch: true,
      isUserStaffMemberAtBillingAddress: true,
      disableAdditionalBranches: true,
    });
  }

  private readonly fb = new FormBuilder();
  private readonly http = inject(HttpClient);
  private readonly keycloak = inject(Keycloak);
  private nextBranchId = 1;
  private nextStaffId = 1;

  readonly roleOptions: { value: string; label: string }[] = [
    { value: 'Employee', label: 'Employee' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Owner', label: 'Owner' },
  ];

  readonly organizationForm = this.fb.group(
    {
      businessName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(120),
        ],
      ],
      billingAddress: this.createAddressGroup(),
      billingAddressIsWorkingBranch: [false],
      isUserStaffMemberAtBillingAddress: [false],
      billingStaffMembers: this.fb.array([]),
      disableAdditionalBranches: [false],
      branches: this.fb.array([this.createBranchGroup()]),
    },
    {
      validators: [
        this.onlyOneSignedInUserBranchValidator(),
        this.billingBranchMustHaveStaffMemberValidator(),
      ],
    },
  );

  submitted = false;
  billingStaffOpen = true;
  submittedPayload: unknown = null;
  branchAccordionState: BranchAccordionState[] = [
    this.createBranchAccordionState(1),
  ];

  private readonly branchLeaving = new Set<number>();
  private readonly staffLeaving = new Set<string>();
  private readonly branchExitDurationMs = 260;
  private readonly staffExitDurationMs = 220;

  get branches(): FormArray<FormGroup> {
    return this.organizationForm.get('branches') as FormArray<FormGroup>;
  }

  get billingStaffMembers(): FormArray<FormGroup> {
    return this.organizationForm.get(
      'billingStaffMembers',
    ) as FormArray<FormGroup>;
  }

  get isAdditionalBranchesDisabled(): boolean {
        return this.organizationForm.controls.disableAdditionalBranches?.value ?? false;
  }

  get noAdditionalUsers(): boolean {
    return this.billingStaffMembers.length === 0 || this.isAdditionalBranchesDisabled;
  }

  branchEmployees(index: number): FormArray<FormGroup> {
    return this.branches.at(index).get('employees') as FormArray<FormGroup>;
  }

  addBillingStaffMember(): void {
    this.billingStaffMembers.push(this.createEmployeeGroup());
    this.organizationForm.updateValueAndValidity();
  }

  removeBillingStaffMember(index: number): void {
    const isUserStaffMemberAtBillingAddress =
      this.organizationForm.get('isUserStaffMemberAtBillingAddress')?.value ??
      false;
    if (
      this.billingStaffMembers.length === 1 &&
      !isUserStaffMemberAtBillingAddress
    ) {
      return;
    }

    this.billingStaffMembers.removeAt(index);
    this.organizationForm.updateValueAndValidity();
  }

  addBranch(): void {
    const isBillingBranch = !!this.organizationForm.get(
      'billingAddressIsWorkingBranch',
    )?.value;
    const disableAdditionalBranches = !!this.organizationForm.get(
      'disableAdditionalBranches',
    )?.value;

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
      const targetIndex = this.branchAccordionState.findIndex(
        (branchState) => branchState.id === state.id,
      );
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
    this.branchAccordionState[branchIndex].staffMemberIds.push(
      this.nextStaffId++,
    );
    this.branches.at(branchIndex).updateValueAndValidity();
  }

  removeEmployee(branchIndex: number, employeeIndex: number): void {
    const employees = this.branchEmployees(branchIndex);
    const signedInUserIsStaffMember = !!this.branches
      .at(branchIndex)
      .get('signedInUserIsStaffMember')?.value;

    if (employees.length === 1 && !signedInUserIsStaffMember) {
      return;
    }

    const county = this.branchAccordionState[branchIndex];
    const staffId = county?.staffMemberIds[employeeIndex];
    if (!county || staffId === undefined) {
      return;
    }

    const staffKey = this.staffKey(county.id, staffId);
    this.staffLeaving.add(staffKey);

    window.setTimeout(() => {
      const latestBranchIndex = this.branchAccordionState.findIndex(
        (branchState) => branchState.id === county.id,
      );
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
    const staffId =
      this.branchAccordionState[branchIndex]?.staffMemberIds[employeeIndex];

    if (branchId === undefined || staffId === undefined) {
      return false;
    }

    return this.staffLeaving.has(this.staffKey(branchId, staffId));
  }

  toggleBranchDetails(branchIndex: number): void {
    const county = this.branchAccordionState[branchIndex];
    county.detailsOpen = !county.detailsOpen;
  }

  toggleBranchStaff(branchIndex: number): void {
    const county = this.branchAccordionState[branchIndex];
    county.staffOpen = !county.staffOpen;
  }

  toggleStaffMember(branchIndex: number, employeeIndex: number): void {
    const county = this.branchAccordionState[branchIndex];
    county.staffMemberPanelsOpen[employeeIndex] =
      !county.staffMemberPanelsOpen[employeeIndex];
  }

  isBranchDetailsOpen(branchIndex: number): boolean {
    return this.branchAccordionState[branchIndex]?.detailsOpen ?? false;
  }

  isBranchStaffOpen(branchIndex: number): boolean {
    return this.branchAccordionState[branchIndex]?.staffOpen ?? false;
  }

  isStaffMemberOpen(branchIndex: number, employeeIndex: number): boolean {
    return (
      this.branchAccordionState[branchIndex]?.staffMemberPanelsOpen[
        employeeIndex
      ] ?? false
    );
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
        branchControl
          .get('signedInUserIsStaffMember')
          ?.setValue(false, { emitEvent: false });
      }
    });

    const billingStaffControl = this.organizationForm.get(
      'isUserStaffMemberAtBillingAddress',
    );
    if (billingStaffControl?.value) {
      billingStaffControl.setValue(false, { emitEvent: false });
    }
  }

  onBillingUserStaffMemberSelected(isChecked: boolean): void {
    if (!isChecked) {
      return;
    }

    this.branches.controls.forEach((branchControl) => {
      branchControl
        .get('signedInUserIsStaffMember')
        ?.setValue(false, { emitEvent: false });
    });
  }

  isOnlyStaffMember(branchIndex: number): boolean {
    const signedInUserIsStaffMember = !!this.branches
      .at(branchIndex)
      .get('signedInUserIsStaffMember')?.value;
    return (
      this.branchEmployees(branchIndex).length === 1 &&
      !signedInUserIsStaffMember
    );
  }

  isOnlyBillingStaffMember(): boolean {
    const isUserStaffMemberAtBillingAddress =
      this.organizationForm.get('isUserStaffMemberAtBillingAddress')?.value ??
      false;
    return (
      this.billingStaffMembers.length < 0 || !isUserStaffMemberAtBillingAddress
    );
  }

  getAddressSummary(branchIndex: number): string {
    const address = this.branches.at(branchIndex).get('address')
      ?.value as AddressSummary | null;
    if (!address) {
      return '';
    }

    return [
      address.street1,
      address.street2,
      address.city,
      address.county,
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

    const isUserStaffMemberAtBillingAddress = this.organizationForm.get('isUserStaffMemberAtBillingAddress')?.value ?? false;
    const isUserStaffMemberAtBranchAddress = this.organizationForm.get('isUserStaffMemberAtBranchAddress')?.value ?? false;

    if (this.isAdditionalBranchesDisabled) {
      if (
        this.organizationForm.controls.billingAddress.invalid ||
        this.organizationForm.controls.billingStaffMembers.invalid
      ) {
        console.error('Organization form is invalid');
        return;
      }
    } else {
      if (this.organizationForm.invalid) {
        console.error('Organization form is invalid');
        return;
      }
    }

    const userId =
      this.keycloak.tokenParsed?.sub ?? this.keycloak.subject ?? '';
    if (!userId) {
      console.error('No signed-in user ID available for organization creation');
      return;
    }

    let payload = this.buildOrganizationPayload();

    if (this.isAdditionalBranchesDisabled) {
      payload['branches'] = [];
    }

    this.createOrganization(payload);

  }

  createOrganization(payload: Record<string, any>): void {
    let token = this.keycloak.token ?? '';

    let branches: Array<AddressRepresentation> = [];

    let userProfileData: UserRepresentation | undefined;
    this.auth.userProfile$.subscribe(userProfile => {
      userProfileData = {
        userId: userProfile?.id ?? '',
        username: userProfile?.username ?? '',
        email: userProfile?.email ?? '',
        firstName: userProfile?.firstName ?? '',
        lastName: userProfile?.lastName ?? '',
        enabled: true,
        emailVerified: userProfile?.emailVerified ?? false
      };
    });

    if (!this.isAdditionalBranchesDisabled) {
      let signleBranch: AddressRepresentation = {
        addressName: payload['billingAddress'].addressName,
        streetLine1: payload['billingAddress'].street1,
        streetLine2: payload['billingAddress'].street2,
        city: payload['billingAddress'].city,
        county: payload['billingAddress'].county,
        postalCode: payload['billingAddress'].postalCode,
        country: payload['billingAddress'].country,
        createTime: undefined,
        isBillingAddress: true,
        members:  [ { ...userProfileData! } ]
      };
      branches.push(signleBranch);
    }
    
    let org: OrganizationRepresentation = {
      name: payload['name'],
      alias: payload['alias'],
      enabled: payload['enabled'],
      description: payload['description'],
      redirectUri: payload['redirectUri'],
      branches: branches
    };

    // Creating an empty organization
    let EmptyOrgPayload: EmptyOrg = {
      name: payload['name'],
      alias: payload['alias'],
      enabled: payload['enabled'],
      description: payload['description'],
      redirectUri: payload['redirectUri'],
    };

    // Create an empty organization 
    this.createOrgApi.createEmptyOrganization(EmptyOrgPayload, token)
      .then(orgId => {
        console.log('Organization created with ID:', orgId);
        org.id = orgId;
      })
      .catch(error => {
        console.error('Error creating organization:', error);
        this.displayError('Failed to create organization', 'Error creating organization: ' + error);
        return;
      });

      // Create default organization groups
      let orgGroups: Array<SimpleGroupRepresentation> = [];

      this.createOrgApi.createDefaultOrganizationGroups(org.id!, token)
        .then(groupIds => {
          console.log('Default organization groups created for organization ID:', org.id);
          orgGroups = groupIds;
        })
        .catch(error => {
          console.error('Error creating default organization groups:', error);
          this.displayError('Failed to create default organization groups', 'Error creating default organization groups: ' + error);
          return;
        });
      
      // Add organization addresses
      this.createOrgApi.addOrganizationAddresses(org.id!, branches, token)
        .then(addressIds => {
          console.log('Organization addresses added for organization ID:', org.id);
          org.branches = org.branches?.map((branch, index) => ({
            ...branch,
            addressId: addressIds[index]
          }));
        })
        .catch(error => {
          console.error('Error adding organization addresses:', error);
          this.displayError('Failed to add organization addresses', 'Error adding organization addresses: ' + error);
          return;
        });
        
        // Create organization users if there are additional users
        if(!this.noAdditionalUsers) {

          this.createOrgApi.createUsers(org.id!, org.users!, token)
            .then(users => {
              console.log('Organization users added for organization ID:', org.id);
              org.users = users;
            })
            .catch(error => {
              console.error('Error adding organization users:', error);
              this.displayError('Failed to add organization users', 'Error adding organization users: ' + error);
              return;
            });

            //add users to addresses
            
            let userAddresses: Array<UserAddressAssignment> = [];
            org.branches?.forEach(branch => {
              branch.members?.forEach(member => {
                userAddresses.push({
                  userId: member.userId!,
                  addressId: branch.addressId!
                });
              });
            });

            this.createOrgApi.assignUsersToAddresses(userAddresses, token)
              .then(() => {
                console.log('Users assigned to addresses for organization ID:', org.id);
              })
              .catch(error => {
                console.error('Error assigning users to addresses:', error);
                this.displayError('Failed to assign users to addresses', 'Error assigning users to addresses: ' + error);
                return;
              });

            //assign users as members to the organization

            this.createOrgApi.assignUsersAsMembers(org.id!, org.users!, token)

            //assign users to default organization groups
            let userGroups: Array<UserGroupAssignment> = [];

            org.branches?.forEach(branch => {
              branch.members!.forEach(member => {
                switch(member.Roles) {
                  case 'Employee':
                    userGroups.push({
                      userId: member.userId!,
                      groupId: orgGroups.find(group => group.name === 'Employees')!.groupId
                    });
                    break;
                  case 'Manager':
                    userGroups.push({
                      userId: member.userId!,
                      groupId: orgGroups.find(group => group.name === 'Managers')!.groupId
                    });
                    break;
                  case 'Owner':
                    userGroups.push({
                      userId: member.userId!,
                      groupId: orgGroups.find(group => group.name === 'Admins')!.groupId
                    });
                    break;
                }
              });
            });
            this.createOrgApi.assignUsersToGroups(org.id!, userGroups, token)
              .then(() => {
                console.log('Users assigned to groups for organization ID:', org.id);
              })
              .catch(error => {
                console.error('Error assigning users to groups:', error);
                this.displayError('Failed to assign users to groups', 'Error assigning users to groups: ' + error);
                return;
              });
      }
      
  }

  displayError(header: string, message: string): void {
    Swal.fire({
      icon: 'error',
      title: header,
      text: message,
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
      county: ['', [Validators.required, Validators.maxLength(80)]],
      postalCode: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z0-9 -]{3,12}$')],
      ],
      country: ['', [Validators.required, Validators.maxLength(80)]],
    });
  }

  private createBranchGroup(): FormGroup {
    return this.fb.group(
      {
        branchName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(120),
          ],
        ],
        address: this.createAddressGroup(),
        employees: this.fb.array([this.createEmployeeGroup()]),
        signedInUserIsStaffMember: [false],
        isBillingAddress: [false],
      },
      { validators: this.branchMustHaveEmployeeValidator() },
    );
  }

  private createEmployeeGroup(): FormGroup {
    return this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(254)],
      ],
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      role: ['employee', [Validators.required]],
    });
  }

  private branchMustHaveEmployeeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const employees = control.get(
        'employees',
      ) as FormArray<FormControl> | null;
      const signedInUserIsStaffMember = !!control.get(
        'signedInUserIsStaffMember',
      )?.value;

      if (!employees || employees.length < 1) {
        return signedInUserIsStaffMember ? null : { noEmployees: true };
      }

      return null;
    };
  }

  private onlyOneSignedInUserBranchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const branches = control.get('branches') as FormArray | null;
      const billingAddressIsWorkingBranch = !!control.get(
        'billingAddressIsWorkingBranch',
      )?.value;
      const isUserStaffMemberAtBillingAddress = !!control.get(
        'isUserStaffMemberAtBillingAddress',
      )?.value;

      if (!branches || branches.length === 0) {
        if (
          billingAddressIsWorkingBranch &&
          isUserStaffMemberAtBillingAddress
        ) {
          return null;
        }
        return null;
      }

      let selectedBranchCount = 0;

      if (billingAddressIsWorkingBranch && isUserStaffMemberAtBillingAddress) {
        selectedBranchCount += 1;
      }

      for (const branchControl of branches.controls) {
        const isSelected = !!(branchControl as FormGroup).get(
          'signedInUserIsStaffMember',
        )?.value;
        if (isSelected) {
          selectedBranchCount += 1;
        }
      }

      return selectedBranchCount > 1
        ? { signedInUserAssignedToMultipleBranches: true }
        : null;
    };
  }

  private billingBranchMustHaveStaffMemberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const billingAddressIsWorkingBranch = !!control.get(
        'billingAddressIsWorkingBranch',
      )?.value;
      const isUserStaffMemberAtBillingAddress = !!control.get(
        'isUserStaffMemberAtBillingAddress',
      )?.value;
      const billingStaffMembers = control.get(
        'billingStaffMembers',
      ) as FormArray | null;

      if (!billingAddressIsWorkingBranch) {
        return null;
      }

      const hasBillingStaff =
        !!billingStaffMembers && billingStaffMembers.length > 0;

      return hasBillingStaff || isUserStaffMemberAtBillingAddress
        ? null
        : { billingBranchNoStaffMembers: true };
    };
  }

  private buildOrganizationPayload(): Record<string, unknown> {
    const formValue = this.organizationForm.getRawValue();
    const businessName = formValue.businessName ?? '';
    const tokenClaims = (this.keycloak.tokenParsed ?? {}) as Record<
      string,
      unknown
    >;
    const preferredUsername =
      typeof tokenClaims['preferred_username'] === 'string'
        ? tokenClaims['preferred_username']
        : 'signed-in user';

    let payload = {
      id: undefined,
      name: businessName,
      alias:
        businessName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'organization',
      enabled: true,
      description: `Business created by ${preferredUsername}`,
      redirectUrl: '',
      billingAddress: formValue.billingAddress,
      billingAddressIsWorkingBranch: formValue.billingAddressIsWorkingBranch,
      isUserStaffMemberAtBillingAddress:
        formValue.isUserStaffMemberAtBillingAddress,
      billingStaffMembers: formValue.billingStaffMembers,
      disableAdditionalBranches: formValue.disableAdditionalBranches,
      branches: formValue.branches,
      members: [],
      groups: [],
    };

    payload.billingAddress = {
      ...payload.billingAddress,
      isBillingAddress: true,
    };

    return payload;
  }

  private createBranchAccordionState(
    employeeCount: number,
  ): BranchAccordionState {
    const staffMemberIds = Array.from(
      { length: employeeCount },
      () => this.nextStaffId++,
    );

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
  county?: string;
  postalCode?: string;
  country?: string;
  isBillingAddress?: boolean;
}
