import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getBookmarkRecord from "@/app/actions/getBookmarkRecord";
import getIsSessionValid from "@/app/actions/getIsSessionValid";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionToken = url.searchParams.get("sessionToken");
    const userId = url.searchParams.get("userId");
    const page_url = url.searchParams.get("page_url");

    const missingFields = [];
    if (!sessionToken) missingFields.push("sessionToken");
    if (!userId) missingFields.push("userId");
    if (!page_url) missingFields.push("page_url");

    if (!sessionToken || !userId || !page_url) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missing_fields: missingFields,
        },
        { status: 400 }
      );
    }

    const isSessionValid = await getIsSessionValid(sessionToken);

    if (!isSessionValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarkRecord = await getBookmarkRecord(
      sessionToken,
      userId,
      page_url
    );

    // // Suppress 404 Error for fetching Bookmarks in production since it's an expected scenario
    // if (!bookmarkRecord) {
    //   return NextResponse.json(
    //     { error: "Bookmark record not found" },
    //     { status: 404 }
    //   );
    // }

    return NextResponse.json(bookmarkRecord);
  } catch (error) {
    console.log(error, "Error fetching bookmark from server.");
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, page_url, note, excerpt, userId, sessionToken } = body;

    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!page_url) missingFields.push("page_url");
    if (!userId) missingFields.push("userId");
    if (!sessionToken) missingFields.push("sessionToken");

    if (!userId || !sessionToken || !title || !page_url) {
      return NextResponse.json(
        {
          error: "Missing required fields or unauthorized",
          missing_fields: missingFields,
        },
        { status: 400 }
      );
    }

    const isSessionValid = await getIsSessionValid(sessionToken)

    if (!isSessionValid) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Check if bookmark already exists for this url
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: userId,
        page_url: page_url,
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        {
          error: "A bookmark with the provided page URL already exists.",
        },
        { status: 409 }
      );
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
    console.log(error, "Error encountered during Bookmark creation process.");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, sessionToken, ...potentialUpdates } = body;

    if (!id || !sessionToken) {
      const missingFields = [];
      if (!id) missingFields.push("id");
      if (!sessionToken) missingFields.push("sessionToken");

      return NextResponse.json(
        {
          error: "Missing required information.",
          missing_fields: missingFields,
        },
        { status: 400 }
      );
    }

    // Check if the request body is empty
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "No fields provided for updating Bookmark record.",
        },
        { status: 400 }
      );
    }

    // Check if there are any valid fields to update
    const validFields = ["title", "page_url", "note", "excerpt"];
    const updates = Object.keys(potentialUpdates)
      .filter(
        (field) =>
          validFields.includes(field) && potentialUpdates[field] != null
      )
      .reduce(
        (acc, field) => ({ ...acc, [field]: potentialUpdates[field] }),
        {}
      );

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "No valid fields provided for updating Bookmark record.",
        },
        { status: 400 }
      );
    }

    // Validate session token
    if (!getIsSessionValid(sessionToken)) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updatedBookmark);
  } catch (error) {
    console.log(error, "Error encountered during Bookmark update process.");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
