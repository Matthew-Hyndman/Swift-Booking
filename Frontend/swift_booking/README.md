# Swift-Booking frontend

Swift-Booking is a SaaS platform that allows small businesses to manage their bookings and appointments. The frontend of the platform is built using Angular, TypeScript, and SCSS. It provides a user-friendly interface for customers to book appointments online and for businesses to manage their bookings and customer data.

## How to build the keycloak theme

run the following command to build the keycloak theme:

```bash
npm run build-keycloak-theme
```

the generated `.jar` file will be located in the `dist` folder. You can then deploy this theme to your Keycloak server by moving the `.jar` file to the `Keycloak/providers` directory of this project. Then restart the Keycloak server to apply the changes.