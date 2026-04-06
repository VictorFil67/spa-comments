-- SPA Comments Database Schema
-- PostgreSQL 16

CREATE TABLE "users" (
    "id"        SERIAL PRIMARY KEY,
    "username"  VARCHAR(100) NOT NULL,
    "email"     VARCHAR(255) NOT NULL,
    "homePage"  VARCHAR(500),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX "IDX_users_username" ON "users" ("username");
CREATE INDEX "IDX_users_email" ON "users" ("email");

CREATE TYPE attachment_type AS ENUM ('image', 'text');

CREATE TABLE "comments" (
    "id"        SERIAL PRIMARY KEY,
    "text"      TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "userId"    INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "parentId"  INTEGER REFERENCES "comments"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_comments_createdAt" ON "comments" ("createdAt");

CREATE TABLE "attachments" (
    "id"           SERIAL PRIMARY KEY,
    "originalName" VARCHAR(255) NOT NULL,
    "fileName"     VARCHAR(255) NOT NULL,
    "filePath"     VARCHAR(500) NOT NULL,
    "mimeType"     VARCHAR(100) NOT NULL,
    "size"         INTEGER NOT NULL,
    "type"         attachment_type NOT NULL,
    "commentId"    INTEGER NOT NULL REFERENCES "comments"("id") ON DELETE CASCADE
);
