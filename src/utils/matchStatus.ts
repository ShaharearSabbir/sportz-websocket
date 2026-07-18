import { MatchStatus } from "../generated/prisma/enums";

export const matchStatus = (
  startTime: string | number | Date,
  endTime: string | number | Date,
  now: Date = new Date(),
): MatchStatus => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) {
    return MatchStatus.SCHEDULED;
  }
  if (now >= end) {
    return MatchStatus.FINISHED;
  }
  return MatchStatus.LIVE;
};
