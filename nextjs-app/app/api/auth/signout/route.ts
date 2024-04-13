import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missing_fields: ["sessionToken"],
        },
        { status: 400 }
      );
    }

    const result = await prisma.session.delete({
      where: { sessionToken },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error, "Error encountered during User sign-out process.");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
