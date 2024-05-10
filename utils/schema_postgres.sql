-- Drop table if exists user (changed to account)
DROP TABLE IF EXISTS account;

-- Create table user
CREATE TABLE account (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  pw_hash VARCHAR(255) NOT NULL
);

-- Drop table if exists follower
DROP TABLE IF EXISTS follower;

-- Create table follower
CREATE TABLE follower (
  who_id INTEGER,
  whom_id INTEGER
);

-- Drop table if exists message
DROP TABLE IF EXISTS message;

-- Create table message
CREATE TABLE message (
  message_id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL,
  text VARCHAR(255) NOT NULL,
  pub_date INTEGER,
  flagged INTEGER
);