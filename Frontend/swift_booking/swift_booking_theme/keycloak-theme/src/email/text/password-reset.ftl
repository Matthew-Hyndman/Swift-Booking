<#ftl output_format="plainText">
<#--
  This file has been claimed for ownership from @keycloakify/email-native version 260007.0.0.
  To relinquish ownership and restore this file to its original content, run the following command:
  
  $ npx keycloakify own --path "email/text/password-reset.ftl" --revert
-->

${msg("passwordResetBody",link, linkExpiration, realmName, linkExpirationFormatter(linkExpiration))}