import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "@/app/actions/sessionActions/getIsSessionValid";
import getUserIdFromUserSession from "@/app/actions/sessionActions/getUserIdFromUserSession";
import { handleError } from "@/app/utils/errorHandler";
import getCollections from "@/app/actions/collectionActions/getCollections";

export async function GET(request: Request) {
  try {
    // Parse params
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") ?? "";
    const sessionToken = url.searchParams.get("sessionToken") ?? "";

    const collections = await getCollections(userId, sessionToken);

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    handleError(error as Error);
  }
}

// TODO: Separate API layer and business layer
export async function POST(request: Request) {
  try {
    // Use NextAuth or sessionToken
    const body = await request.json();
    const { name, sessionToken } = body;

    // Get userId from request body or current user session
    let { userId } = body;
    if (!userId) {
      userId = await getUserIdFromUserSession();
    }
    if (!userId || !(await getIsSessionValid(sessionToken))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request parameters
    if (!name) {
      return NextResponse.json(
        { error: "Missing required fields", missing_fields: ["name"] },
        { status: 400 }
      );
    }

    const existingCollection = await prisma.collection.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: "A Collection with the provided name already exists." },
        { status: 409 }
      );
    }

    const newCollection = await prisma.collection.create({
      data: {
        userId,
        name,
      },
    });

    return NextResponse.json(newCollection);
  } catch (error: any) {
    console.log(error, "Error encountered during Collection creation process.");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
