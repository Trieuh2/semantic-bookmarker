import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "@/app/actions/getIsSessionValid";
import getUserIdFromUserSession from "@/app/actions/getUserIdFromUserSession";

export async function GET(request: Request) {
  try {
    // Parse params
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get("sessionToken");
    const userId = url.searchParams.get("userId");

    // Handle missing fields
    const missingFields = [];
    if (!sessionToken) missingFields.push("sessionToken");
    if (!userId) missingFields.push("userId");

    if (!sessionToken || !userId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missing_fields: missingFields,
        },
        { status: 400 }
      );
    }

    // Validate session
    const isSessionValid = await getIsSessionValid(sessionToken);

    if (!isSessionValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Collections
    const collections = await prisma.collection.findMany({
      where: {
        userId,
      },
      take: 10,
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.log(error, "Error fetching bookmark from server.");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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
