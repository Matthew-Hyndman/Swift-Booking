import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginChoice } from './login-choice';

describe('LoginChoice', () => {
  let component: LoginChoice;
  let fixture: ComponentFixture<LoginChoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginChoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginChoice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
