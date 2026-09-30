import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOrganization } from './manage-organization';

describe('ManageOrganization', () => {
  let component: ManageOrganization;
  let fixture: ComponentFixture<ManageOrganization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageOrganization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageOrganization);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
