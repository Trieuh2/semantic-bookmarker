import { NextResponse } from "next/server";
import { handleError } from "@/app/utils/errorHandler";
import getAllCollections from "@/app/actions/collectionActions/getAllCollections";
import { createCollection } from "@/app/actions/collectionActions/createCollection";

export async function GET(request: Request) {
  try {
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const collections = await getAllCollections(sessionToken);

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    handleError(error as Error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const collection = createCollection(sessionToken, name);

    return NextResponse.json({ success: true, data: collection });
  } catch (error: any) {
    handleError(error);
  }
}
