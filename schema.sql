DROP DATABASE IF EXISTS stackledb;
CREATE DATABASE stackledb;

\c stackledb

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  password TEXT,
  username TEXT
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users (id),
  title TEXT,
  body TEXT
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question_id INTEGER REFERENCES questions(id),
  accepted BOOLEAN,
  body TEXT
);

CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question_id INTEGER REFERENCES questions(id)
);
