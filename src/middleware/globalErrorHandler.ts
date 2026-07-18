// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../helper/apiResponse";

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Pass off straight to your standard formatter
  ApiResponse.error(res, 500, "An unexpected crash error occurred.", error);
};
