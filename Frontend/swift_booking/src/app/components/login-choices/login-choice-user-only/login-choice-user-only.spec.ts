import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginChoiceUserOnly } from './login-choice-user-only';

describe('LoginChoiceUserOnly', () => {
  let component: LoginChoiceUserOnly;
  let fixture: ComponentFixture<LoginChoiceUserOnly>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginChoiceUserOnly]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginChoiceUserOnly);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
