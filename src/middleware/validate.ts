import { ZodType, z } from "zod";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { formatZodError } from "../utils.js";

// Extend Request to hold validated data
declare global {
  namespace Express {
    interface Request {
      validatedData?: unknown;
    }
  }
}
// Generic helper type
type RequestWithValidated<T extends ZodType> = Request & {
  validatedData: z.infer<T>;
};

// Middleware Factory
export function validate<T extends ZodType>(
  schema: T,
  source: "body" | "query" | "params" = "body",
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const formattedErrors = formatZodError(result.error);

      return res.status(400).json({
        message: "Validation failed",
        issues: result.error.issues,
        errors: formattedErrors,
      });
    }
    // Attach typed data
    (req as RequestWithValidated<T>).validatedData = result.data;

    next();
  };
}

// Response validator
export function sendValidated<T extends ZodType>(
  res: Response,
  data: unknown,
  schema: T,
) {
  const result = schema.safeParse(data);

  if (!result.success) {
    return res.status(500).json({
      message: "Response validation failed",
      errors: formatZodError(result.error),
      issues: result.error.issues,
    });
  }

  return res.json(result.data);
}
