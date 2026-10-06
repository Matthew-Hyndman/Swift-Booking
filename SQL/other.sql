-- this is just a file to run small queries to test make adjustments 
-- to the database, it is not part of the main project.

ALTER TABLE user_entity
ADD CONSTRAINT fk_user_entity_address
FOREIGN KEY (address_id) REFERENCES addresses(address_id);