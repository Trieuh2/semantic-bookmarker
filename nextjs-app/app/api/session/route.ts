import getSessionRecord from "@/app/actions/getSessionRecord";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get("sessionToken");

    if (!sessionToken) {
      return new NextResponse("Missing sessionToken.", { status: 400 });
    }

    const sessionRecord = await getSessionRecord(sessionToken);
    return NextResponse.json(sessionRecord);
  } catch (error: any) {
    console.log(error, "Error fetching session from server.");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
