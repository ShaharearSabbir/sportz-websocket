import { z } from "zod";

export const MATCH_STATUS = {
  SCHEDULED: "SCHEDULED",
  LIVE: "LIVE",
  FINISHED: "FINISHED",
} as const;

export const listMatchesQuerySchema = z.object({
  limit: z.preprocess(
    (val) => (val === undefined ? undefined : Number(val)),
    z.number().int().positive().max(100).default(50).optional(),
  ),
});

export const matchIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1),
    homeTeam: z.string().trim().min(1),
    awayTeam: z.string().trim().min(1),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "must be a valid ISO 8601 date string",
    }),
    endTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "must be a valid ISO 8601 date string",
      })
      .optional(),
    homeScore: z.coerce.number().int().nonnegative().default(0).optional(),
    awayScore: z.coerce.number().int().nonnegative().default(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endTime && new Date(data.endTime) <= new Date(data.startTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endTime must be after startTime",
        path: ["endTime"],
      });
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});

export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>;
export type MatchIdParam = z.infer<typeof matchIdParamSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
