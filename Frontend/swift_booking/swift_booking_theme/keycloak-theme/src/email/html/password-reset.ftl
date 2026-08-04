<#--
  This file has been claimed for ownership from @keycloakify/email-native version 260007.0.0.
  To relinquish ownership and restore this file to its original content, run the following command:
  
  $ npx keycloakify own --path "email/html/password-reset.ftl" --revert
-->

<#import "template.ftl" as layout>
<@layout.emailLayout>
<div style="border: 1px solid rgba(255, 255, 255, 0.62); background: linear-gradient(140deg, rgba(243, 243, 243, 0.48), rgba(243, 243, 243, 0.2)); backdrop-filter: blur(16px); box-shadow: 0 10px 30px rgba(56, 69, 92, 0.14); border-radius: 1rem;">
${kcSanitize(msg("passwordResetBodyHtml",link, linkExpiration, realmName, linkExpirationFormatter(linkExpiration)))?no_esc}
</div>
</@layout.emailLayout>
