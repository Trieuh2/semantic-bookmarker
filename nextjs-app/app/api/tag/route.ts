import { NextResponse } from "next/server";
import createTag from "@/app/actions/tagActions/createTag";
import { handleError } from "@/app/utils/errorHandler";
import getAllTags from "@/app/actions/tagActions/getAllTags";

export async function GET(request: Request) {
  try {
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const tags = await getAllTags(sessionToken);

    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    handleError(error as Error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, sessionToken, name } = body;
    const tag = createTag(userId, sessionToken, name);

    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    handleError(error as Error);
  }
}
