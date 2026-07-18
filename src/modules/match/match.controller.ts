import { ApiResponse } from "../../helper/apiResponse";
import { catchAsync } from "../../helper/catchAsync";
import { matchService } from "./match.service";
import {
  CreateMatchInput,
  createMatchSchema,
  ListMatchesQuery,
  listMatchesQuerySchema,
} from "./match.validation";

export const matchController = {
  addMatch: catchAsync(async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
      ApiResponse.error(res, 400, parsed.error.message, parsed.error);
    }

    const newMatch = parsed.data as CreateMatchInput;

    const result = await matchService.addMatch(newMatch);
    ApiResponse.success(res, 201, "Match created successfully", result);
  }),

  getMatches: catchAsync(async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      ApiResponse.error(res, 400, parsed.error.message, parsed.error);
    }
    const query = parsed.data as ListMatchesQuery;
    const matches = await matchService.getMatches(query);
    ApiResponse.success(res, 200, "Matches retrieved successfully", matches);
  }),
};
