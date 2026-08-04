<#--
  This file has been claimed for ownership from @keycloakify/email-native version 260007.0.0.
  To relinquish ownership and restore this file to its original content, run the following command:
  
  $ npx keycloakify own --path "email/html/template.ftl" --revert
-->

<#macro emailLayout>
<html>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; color: #1e2330; background-color: #97f8ffa4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; background-color: #eef4ff;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 640px; border-collapse: separate; background-color: #ffffff; border: 1px solid #dbe7ff; border-radius: 18px;">
          <tr>
            <td align="center" style="padding: 26px 24px 14px 24px; background-color: #f6f9ff; border-bottom: 1px solid #e6eeff;">
              <img
                alt="Swift Booking"
                src="https://swift-booking-public.s3.eu-west-2.amazonaws.com/kc-logo.png"
                width="240px"
                style="display: block; margin: 0 auto; width: 240px; max-width: 80%; height: auto;"
              >
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 24px 10px 24px;">
              <#nested>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 24px 24px 24px; color: #6b7280; font-size: 12px; line-height: 1.5;">
              Swift Booking account notifications are sent automatically. If you were not expecting this email, you can ignore it.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
</#macro>
