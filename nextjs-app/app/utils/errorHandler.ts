import { NextResponse } from "next/server";
import { isCustomError } from "./isCustomError";

export function handleError(error: Error): NextResponse {
  if (isCustomError(error)) {
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: error.statusCode,
      }
    );
  } else {
    console.error(error); // Log the actual error for server-side visibility
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      {
        status: 500,
      }
    );
  }
}
