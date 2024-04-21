import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "@/app/actions/sessionActions/getIsSessionValid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, userId, sessionToken } = body;

    const missingFields = [];
    if (!name) missingFields.push("title");
    if (!userId) missingFields.push("userId");
    if (!sessionToken) missingFields.push("sessionToken");

    if (!name || !userId || !sessionToken) {
      return NextResponse.json(
        {
          error: "Missing required fields or unauthorized",
          missing_fields: missingFields,
        },
        { status: 400 }
      );
    }

    const isSessionValid = await getIsSessionValid(sessionToken);

    if (!isSessionValid) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Check if tag already exists for this user
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existingTag) {
      return NextResponse.json(
        {
          error: "A tag with the provided name already exists.",
        },
        { status: 409 }
      );
    }

    const newTag = await prisma.tag.create({
      data: {
        name: name,
        userId: userId,
      },
    });

    return NextResponse.json(newTag);
  } catch (error) {
    console.log(error, "Error encountered during Tag creation process.");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
