import prisma from "../../lib/prisma";
import { matchStatus } from "../../utils/matchStatus";
import { CreateMatchInput, ListMatchesQuery } from "./match.validation";

export const matchService = {
  addMatch: async (matchData: CreateMatchInput) => {
    return await prisma.match.create({
      data: {
        ...matchData,
        status: matchStatus(matchData.startTime, matchData.endTime as string),
      },
    });
  },

  getMatches: async (query: ListMatchesQuery) => {
    return await prisma.match.findMany({
      ...(query.limit && { take: query.limit }),
      orderBy: {
        startTime: "asc",
      },
    });
  },
};
