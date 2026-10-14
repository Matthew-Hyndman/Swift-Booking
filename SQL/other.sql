-- this is just a file to run small queries to test make adjustments 
-- to the database, it is not part of the main project.

SELECT address_id,
       organization_id,
       street_line1,
       street_line2,
       city,
       county,
       postal_code,
       country,
       created_at,
       address_name,
       is_billing_address
FROM public.addresses
LIMIT 1000;

SELECT id,
       email,
       email_constraint,
       email_verified,
       enabled,
       federation_link,
       first_name,
       last_name,
       realm_id,
       username,
       created_timestamp,
       service_account_client_link,
       not_before,
       last_modified_timestamp,
       address_id
FROM public.user_entity
LIMIT 1000;

SELECT *
FROM public.org
--WHERE AddressId IS NOT NULL
LIMIT 1000;


ALTER TABLE public.addresses RENAME COLUMN "addressId" TO "address_id";
ALTER TABLE public.user_entity RENAME COLUMN "addressId" TO "address_id";

UPDATE public.user_entity
SET address_id = NULL
WHERE address_id IS NOT NULL;

DELETE FROM public.addresses;