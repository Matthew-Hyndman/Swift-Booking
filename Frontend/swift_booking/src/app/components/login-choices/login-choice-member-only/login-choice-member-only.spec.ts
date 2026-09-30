import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginChoiceMemberOnly } from './login-choice-member-only';

describe('LoginChoiceMemberOnly', () => {
  let component: LoginChoiceMemberOnly;
  let fixture: ComponentFixture<LoginChoiceMemberOnly>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginChoiceMemberOnly]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginChoiceMemberOnly);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
