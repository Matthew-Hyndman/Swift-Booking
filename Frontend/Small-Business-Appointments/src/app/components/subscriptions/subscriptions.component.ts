import { Component } from '@angular/core';

interface SubscriptionPlan {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  highlights: string[];
}

@Component({
  selector: 'app-subscriptions',
  standalone: false,
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent {
  readonly plans: SubscriptionPlan[] = [
    {
      name: 'Core',
      monthlyPrice: '$19',
      yearlyPrice: '$190',
      description: 'Ideal for solo operators starting appointment operations.',
      highlights: ['Up to 100 bookings/month', '1 business profile', 'Email support']
    },
    {
      name: 'Growth',
      monthlyPrice: '$49',
      yearlyPrice: '$490',
      description: 'Designed for growing teams with repeat booking traffic.',
      highlights: ['Up to 600 bookings/month', 'Up to 10 team members', 'Priority support']
    },
    {
      name: 'Pro',
      monthlyPrice: '$99',
      yearlyPrice: '$990',
      description: 'For high-volume service businesses with multiple staff.',
      highlights: ['Unlimited bookings', 'Advanced analytics', 'Dedicated onboarding']
    }
  ];
}
