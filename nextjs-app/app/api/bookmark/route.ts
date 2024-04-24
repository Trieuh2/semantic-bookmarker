import { NextResponse } from "next/server";
import getBookmark from "@/app/actions/bookmarkActions/getBookmark";
import deleteBookmark from "@/app/actions/bookmarkActions/deleteBookmark";
import addBookmark from "@/app/actions/bookmarkActions/addBookmark";
import { handleError } from "@/app/utils/errorHandler";
import { updateBookmark } from "@/app/actions/bookmarkActions/updateBookmark";
import getAllBookmarks from "@/app/actions/bookmarkActions/getAllBookmarks";
import getBookmarksFromCollection from "@/app/actions/bookmarkActions/getBookmarksFromCollection";

export async function fetchData(
  userId: string,
  sessionToken: string,
  page_url: string,
  collection_name: string
) {
  if (collection_name !== "") {
    return await getBookmarksFromCollection(
      userId,
      sessionToken,
      collection_name
    );
  } else if (page_url) {
    return await getBookmark(userId, sessionToken, page_url);
  }
  return await getAllBookmarks(userId, sessionToken);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") ?? "";
    const sessionToken = url.searchParams.get("sessionToken") ?? "";
    const page_url = url.searchParams.get("page_url") ?? "";
    const collection_name = url.searchParams.get("collection_name") ?? "";

    const data = await fetchData(
      userId,
      sessionToken,
      page_url,
      collection_name
    );

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      sessionToken,
      title,
      page_url,
      note,
      excerpt,
      collection_name,
    } = body;

    const newBookmark = await addBookmark(
      userId,
      sessionToken,
      title,
      page_url,
      note,
      excerpt,
      collection_name
    );

    return NextResponse.json({ success: true, data: newBookmark });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionToken = "",
      id = "",
      title = "",
      note = "",
      collection_name = "",
      tags = [],
      page_url = "",
      excerpt = "",
    } = body;

    const updatedBookmark = await updateBookmark(
      sessionToken,
      id,
      title,
      note,
      collection_name,
      tags,
      page_url,
      excerpt
    );

    return NextResponse.json({ success: true, data: updatedBookmark });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId, sessionToken, id } = body;
    const deletedBookmark = await deleteBookmark(userId, sessionToken, id);

    return NextResponse.json({ success: true, data: deletedBookmark });
  } catch (error) {
    return handleError(error as Error);
  }
}
