import { NextResponse } from "next/server";
import getBookmark from "@/app/actions/bookmarkActions/getBookmark";
import deleteBookmark from "@/app/actions/bookmarkActions/deleteBookmark";
import addBookmark from "@/app/actions/bookmarkActions/addBookmark";
import { handleError } from "@/app/utils/errorHandler";
import { updateBookmark } from "@/app/actions/bookmarkActions/updateBookmark";
import getAllBookmarks from "@/app/actions/bookmarkActions/getAllBookmarks";
import getBookmarksFromCollection from "@/app/actions/bookmarkActions/getBookmarksFromCollection";
import getBookmarksFromTagId from "@/app/actions/bookmarkActions/getBookmarksFromTagId";
import getBookmarksFromSearch from "@/app/actions/bookmarkActions/getBookmarksFromSearch";

export async function fetchData(
  sessionToken: string,
  page_url: string,
  collectionId: string,
  tagId: string,
  searchQuery: string
) {
  if (collectionId) {
    return await getBookmarksFromCollection(sessionToken, collectionId);
  } else if (page_url) {
    return await getBookmark(sessionToken, page_url);
  } else if (tagId) {
    return await getBookmarksFromTagId(sessionToken, tagId);
  } else if (searchQuery) {
    return await getBookmarksFromSearch(sessionToken, searchQuery);
  }
  return await getAllBookmarks(sessionToken);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const page_url = url.searchParams.get("page_url") ?? "";
    const collectionId = url.searchParams.get("collectionId") ?? "";
    const tagId = url.searchParams.get("tagId") ?? "";
    const searchQuery = url.searchParams.get("searchQuery") ?? "";

    const data = await fetchData(
      sessionToken,
      page_url,
      collectionId,
      tagId,
      searchQuery
    );

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, page_url, note, excerpt, collection_name } = body;
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";

    const newBookmark = await addBookmark(
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
      id = "",
      title = "",
      note = "",
      collection_name = "",
      tags = [],
      page_url = "",
      excerpt = "",
    } = body;
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";

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
    const { id } = body;
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";

    const deletedBookmark = await deleteBookmark(sessionToken, id);

    return NextResponse.json({ success: true, data: deletedBookmark });
  } catch (error) {
    return handleError(error as Error);
  }
}
