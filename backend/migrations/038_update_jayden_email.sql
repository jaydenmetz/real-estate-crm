-- Update Jayden personal account to realtor@jaydenmetz.com
UPDATE users 
SET email = 'realtor@jaydenmetz.com',
    username = 'realtor'
WHERE email = 'jayden@jaydenmetz.com';

UPDATE contacts
SET email = 'realtor@jaydenmetz.com'
WHERE email = 'jayden@jaydenmetz.com';
