import getSession from "@/app/actions/sessionActions/getSession";
import { NextResponse } from "next/server";
import { handleError } from "@/app/utils/errorHandler";
import deleteSession from "@/app/actions/sessionActions/deleteSession";

export async function GET(request: Request) {
  try {
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const session = await getSession(sessionToken);

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionToken = request.headers.get("Authorization")?.replace("Bearer ", "") ?? ""

    const deletedSession = await deleteSession(sessionToken);
    return NextResponse.json({ success: true, data: deletedSession });
  } catch (error: any) {
    return handleError(error as Error);
  }
}
