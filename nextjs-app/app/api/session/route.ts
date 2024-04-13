import getSessionRecord from "@/app/actions/getSessionRecord";
import { SessionError } from "@/app/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get("sessionToken");

    if (!sessionToken) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missing_fields: ["sessionToken"],
        },
        { status: 400 }
      );
    }

    const sessionRecord = await getSessionRecord(sessionToken);
    return NextResponse.json(sessionRecord);
  } catch (error: unknown) {
    console.error("Error fetching session from server:", error);

    if (error instanceof SessionError) {
      return NextResponse.json(
        {
          error: error.message,
          errorCode: error.code,
        },
        {
          status: error.code === "MISSING_TOKEN" ? 400 : (error.code === "NOT_FOUND" ? 404 : 500),
        }
      );
    }
  }
}
