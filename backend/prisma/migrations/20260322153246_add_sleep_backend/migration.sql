CREATE TABLE "Sleep" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "hours" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Sleep_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Sleep_userId_date_key" ON "Sleep"("userId", "date");

ALTER TABLE "Sleep" ADD CONSTRAINT "Sleep_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
