# Keycloak Authentication Test Cases

| Test Case | Description | Passed | Notes |
|-----------|-------------|--------|-------|
| Login with Valid Credentials | User logs in with correct username and password | | |
| Login with Invalid Password | User attempts login with wrong password | | |
| Login with Invalid Username | User attempts login with non-existent username | | |
| Account Lockout | Account locks after multiple failed login attempts | | |
| Token Generation | Verify access token is generated on successful login | | |
| Token Expiration | Verify token expires after configured time | | |
| Token Refresh | Verify refresh token works to obtain new access token | | |
| Logout | User successfully logs out and token is invalidated | | |
| Multi-Factor Authentication | MFA verification succeeds with valid code | | |
| MFA Failure | Login fails with invalid MFA code | | |
| User Registration | New user account creation succeeds | | |
| Password Reset | User can reset forgotten password | | |
| Permission Verification | User has correct roles and permissions | | |
| Session Timeout | Session expires after inactivity period | | |
| HTTPS Connection | Authentication works over secure connection | | |
