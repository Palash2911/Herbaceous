/*
  Warnings:
  - Renamed the column `email` on the `User` table to `syntheticEmail`.
  - Renamed the column `name` on the `User` table to `displayName`.
*/

-- DropIndex
drop index "User_email_key";

-- RenameColumn
alter table "User" rename column "email" to "syntheticEmail";
alter table "User" rename column "name" to "displayName";

-- CreateIndex
create unique index "User_syntheticEmail_key" on
    "User" (
        "syntheticEmail"
    );