-- Drop table if exists user (changed to account)
DROP TABLE IF EXISTS account;
DROP INDEX IF EXISTS idx_userid;

-- Create table user
CREATE TABLE account (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  pw_hash VARCHAR NOT NULL
);
-- Create index on user
CREATE INDEX idx_userid ON account (user_id);


-- Drop table if exists follower
DROP TABLE IF EXISTS follower;
DROP INDEX IF EXISTS idx_whoid;
DROP INDEX IF EXISTS idx_whomid;

-- Create table follower
CREATE TABLE follower (
  who_id INTEGER,
  whom_id INTEGER
);

-- Create index on follower
CREATE INDEX idx_whoid ON follower (who_id);
CREATE INDEX idx_whomid ON follower (whom_id);

-- Drop table if exists message
DROP TABLE IF EXISTS message;
DROP INDEX IF EXISTS idx_messageid;
DROP INDEX IF EXISTS idx_pubdata;
DROP INDEX IF EXISTS idx_authorid;

-- Create table message
CREATE TABLE message (
  message_id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL,
  text VARCHAR NOT NULL,
  pub_date INTEGER,
  flagged INTEGER
);

-- Create index on message  
CREATE INDEX idx_messageid ON message (message_id);
CREATE INDEX idx_pubdata ON message (pub_date);
CREATE INDEX idx_authorid ON message (author_id);