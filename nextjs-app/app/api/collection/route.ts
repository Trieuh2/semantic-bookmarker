import { NextResponse } from "next/server";
import { handleError } from "@/app/utils/errorHandler";
import getAllCollections from "@/app/actions/collectionActions/getAllCollections";
import { createCollection } from "@/app/actions/collectionActions/createCollection";
import deleteCollection from "@/app/actions/collectionActions/deleteCollection";

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

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const deletedCollection = await deleteCollection(sessionToken, id);

    return NextResponse.json({ success: true, data: deletedCollection });
  } catch (error) {
    return handleError(error as Error);
  }
}