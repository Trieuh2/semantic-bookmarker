import getSession from "@/app/actions/getSession";
import { NextResponse } from "next/server";
import { handleError } from "@/app/utils/errorHandler";
import deleteSession from "@/app/actions/deleteSession";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get("sessionToken") ?? "";
    const session = await getSession(sessionToken);

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    const deletedSession = await deleteSession(sessionToken);
    return NextResponse.json({ success: true, data: deletedSession });
  } catch (error: any) {
    return handleError(error as Error);
  }
}
