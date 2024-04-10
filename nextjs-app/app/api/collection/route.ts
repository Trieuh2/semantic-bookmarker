import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { name } = body;

    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Missing information", { status: 400 });
    }

    const existingCollection = await prisma.collection.findUnique({
      where: { name },
    });
    if (existingCollection) {
      return new NextResponse("Collection already exists", { status: 409 });
    }

    const newCollection = await prisma.collection.create({
      data: {
        userId: currentUser.id,
        name: name,
      },
    });

    return NextResponse.json(newCollection);
  } catch (error: any) {
    console.log(error, "COLLECTION_CREATION_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
