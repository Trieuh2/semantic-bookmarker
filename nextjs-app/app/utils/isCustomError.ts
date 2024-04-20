import { CustomError } from "../libs/errors";

// Type guard to check if the error is one of the custom errors with a statusCode
export function isCustomError(error: any): error is CustomError {
  return error instanceof Error && "statusCode" in error;
}
