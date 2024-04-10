import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return new NextResponse("Missing sessionToken", { status: 400 });
    }

    const result = await prisma.session.delete({
      where: { sessionToken },
    });

    return NextResponse.json(result)
  } catch (error: any) {
    console.log(error, "Error signing out.");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
