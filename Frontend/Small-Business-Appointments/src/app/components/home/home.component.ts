import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly highlights = [
    'Single place to manage business bookings and customers.',
    'Fast scheduling flows for teams and independent operators.',
    'Actionable analytics for demand, status, and staff workloads.'
  ];
}
