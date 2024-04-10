import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getBookmarkRecord from "@/app/actions/getBookmarkRecord";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get("sessionToken");
    const userId = url.searchParams.get("userId");
    const page_url = url.searchParams.get("page_url");

    if (!sessionToken) {
      return new NextResponse("Missing sessionToken.", { status: 400 });
    }
    if (!userId) {
      return new NextResponse("Missing userId.", { status: 400 });
    }
    if (!page_url) {
      return new NextResponse("Missing page_url.", { status: 400 });
    }

    // TODO: VALIDATE SESSION IS VALID

    const bookmarkRecord = await getBookmarkRecord(
      sessionToken,
      userId,
      page_url
    );

    return NextResponse.json(bookmarkRecord);
  } catch (error) {
    console.log(error, "Error fetching bookmark from server.");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, page_url, note, excerpt, userId, sessionToken } = body;

    if (!userId || !sessionToken) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!title || !page_url) {
      return new NextResponse("Missing information.", { status: 400 });
    }

    // TODO: validate userId and sessionToken

    // Check if bookmark already exists for this url
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: userId,
        page_url: page_url,
      },
    });

    if (existingBookmark) {
      // TODO: UPDATE EXISTING
      return NextResponse.json(existingBookmark);
    }

    const newBookmark = await prisma.bookmark.create({
      data: {
        title: title,
        page_url: page_url,
        note: note ?? "",
        excerpt: excerpt ?? "",
        userId: userId,
      },
    });

    return NextResponse.json(newBookmark);
  } catch (error) {
    console.log(error, "Error creating bookmark.");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
