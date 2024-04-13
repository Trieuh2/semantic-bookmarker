import getSessionRecord from "@/app/actions/getSessionRecord";
import { SessionError } from "@/app/types";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

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

    if (!sessionRecord) {
      return NextResponse.json(
        { error: "Session record not found." },
        { status: 404 }
      );
    }

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
          status:
            error.code === "MISSING_TOKEN"
              ? 400
              : error.code === "NOT_FOUND"
              ? 404
              : 500,
        }
      );
    }
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missing_fields: ["sessionToken"],
        },
        { status: 400 }
      );
    }

    const result = await prisma.session.delete({
      where: { sessionToken },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error, "Error encountered during User sign-out process.");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
