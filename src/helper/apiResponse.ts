// src/utils/api-response.ts
import { Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";

interface PrismaErrorLike {
  code?: string;
  meta?: Record<string, unknown>;
  message?: string;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T | null = null,
  ): Response {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    error: unknown = null,
  ): Response {
    const isProduction = process.env.NODE_ENV === "production";

    let finalStatusCode = statusCode;
    let finalMessage = message;
    let errorPayload: unknown = null;

    // 1. AppError (Custom operational errors thrown deliberately)
    if (error instanceof AppError) {
      finalStatusCode = error.statusCode;
      finalMessage = error.message;
    }

    // 2. Zod Validation Errors
    else if (error instanceof ZodError) {
      finalStatusCode = 400;
      const fieldErrors = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      finalMessage = fieldErrors.join(", ") || "Validation validation error.";
      errorPayload = error.flatten().fieldErrors;
    }

    // 3. Prisma Database Errors
    else if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as PrismaErrorLike;

      switch (prismaError.code) {
        case "P2002":
          finalStatusCode = 409;
          const target =
            (prismaError.meta?.target as string[])?.join(", ") || "field";
          finalMessage = `A record with this ${target} already exists.`;
          break;
        case "P2025":
          finalStatusCode = 404;
          finalMessage =
            (prismaError.meta?.cause as string) ||
            "Requested entry was not found.";
          break;
        case "P2003":
          finalStatusCode = 400;
          finalMessage =
            "Database relationship restriction violated (Foreign key failed).";
          break;
        default:
          if (String(prismaError.constructor.name).startsWith("Prisma")) {
            finalStatusCode = 500;
            finalMessage = "A system database operation failed.";
          }
          break;
      }
      errorPayload = isProduction
        ? null
        : { code: prismaError.code, meta: prismaError.meta };
    }

    // 4. Standard Express/Built-in Node Errors
    else if (error instanceof Error) {
      // Handle syntax errors (e.g., bad JSON format sent in body)
      if (error instanceof SyntaxError && "status" in error) {
        finalStatusCode = 400;
        finalMessage = "Invalid JSON syntax parsed in request body.";
      } else {
        // Fallback for general unexpected unhandled errors
        finalStatusCode = finalStatusCode === 200 ? 500 : finalStatusCode;
        finalMessage = error.message || "Internal Server Error";
      }

      errorPayload = isProduction
        ? null
        : { name: error.name, stack: error.stack };
    }

    // Build Payload
    const responseBody: { success: false; message: string; error?: unknown } = {
      success: false,
      message: finalMessage,
    };

    if (errorPayload) {
      responseBody.error = errorPayload;
    }

    return res.status(finalStatusCode).json(responseBody);
  }
}
