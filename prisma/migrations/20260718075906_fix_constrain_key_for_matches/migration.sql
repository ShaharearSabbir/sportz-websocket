/*
  Warnings:

  - A unique constraint covering the columns `[sport,homeTeam,awayTeam,startTime]` on the table `matches` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "matches_sport_homeTeam_awayTeam_startTime_key" ON "matches"("sport", "homeTeam", "awayTeam", "startTime");
