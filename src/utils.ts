import { ZodError } from "zod";

type FormattedErrors = Record<string, string[]>;

export function formatZodError(error: ZodError): FormattedErrors {
  return error.issues.reduce((acc, issue) => {
    const key = issue.path.join(".") || "root";

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(issue.message);

    return acc;
  }, {} as FormattedErrors);
}