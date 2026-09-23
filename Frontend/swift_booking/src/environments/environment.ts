export const environment = {
  production: true,
  apiBaseUrl: '/api',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'swift-booking',
    userClientId: 'swift-booking-web',
    memberClientId: 'swift-booking-local-client-for-members'
  }
};
