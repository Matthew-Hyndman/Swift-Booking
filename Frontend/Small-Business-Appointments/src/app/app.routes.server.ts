import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'subscriptions',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'payment',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'account',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'bookings',
    renderMode: RenderMode.Server
  },
  {
    path: 'bookings/new',
    renderMode: RenderMode.Server
  },
  {
    path: 'bookings/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
