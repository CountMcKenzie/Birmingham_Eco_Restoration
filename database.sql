CREATE TABLE IF NOT EXISTS submissions (
    id            SERIAL PRIMARY KEY,
    role          VARCHAR(10)  NOT NULL,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    phone         VARCHAR(50)  NOT NULL,
    address       TEXT         NOT NULL,
    housing       VARCHAR(10),
    home_address  TEXT,
    people_count  INTEGER,
    submitted_at  TIMESTAMP    NOT NULL
);

ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
