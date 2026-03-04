ALTER TABLE "User" ADD COLUMN "username" TEXT;

UPDATE "User"
SET "username" = 'user_' || "id"
WHERE "username" IS NULL OR "username" = '';

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
