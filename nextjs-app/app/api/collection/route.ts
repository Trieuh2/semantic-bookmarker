import { NextResponse } from "next/server";
import { handleError } from "@/app/utils/errorHandler";
import getCollections from "@/app/actions/collectionActions/getCollections";
import { createCollection } from "@/app/actions/collectionActions/createCollection";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") ?? "";
    const sessionToken = url.searchParams.get("sessionToken") ?? "";

    const collections = await getCollections(userId, sessionToken);

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    handleError(error as Error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionToken, name } = body;
    const collection = createCollection(sessionToken, name);

    return NextResponse.json({ success: true, data: collection });
  } catch (error: any) {
    handleError(error);
  }
}
