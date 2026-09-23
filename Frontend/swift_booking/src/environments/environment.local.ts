export const environment = {
  production: false,
  apiBaseUrl: '/api',
  baseFrontendUrl: 'http://localhost:4200',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'Swift-Booking',
    userClientId: 'swift-booking-local-client',
    memberClientId: 'swift-booking-local-client-for-members'
  }
};
