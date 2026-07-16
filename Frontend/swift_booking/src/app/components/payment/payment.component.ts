import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {
  readonly planOptions = ['Core', 'Growth', 'Pro'];

  form = {
    plan: 'Core',
    fullName: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    billingPostcode: ''
  };

  isSubmitting = false;
  message = '';
  error = '';

  constructor(private readonly route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((params) => {
      const selectedPlan = params.get('plan');
      if (selectedPlan && this.planOptions.includes(selectedPlan)) {
        this.form.plan = selectedPlan;
      }
    });
  }

  submitPayment(): void {
    this.error = '';
    this.message = '';

    if (!this.form.fullName || !this.form.email || !this.form.cardNumber || !this.form.expiry || !this.form.cvc) {
      this.error = 'Please complete all required payment fields.';
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.message = `Payment method saved for ${this.form.plan} plan. You can now continue setup from your account page.`;
    }, 600);
  }
}
