import { NextResponse } from "next/server";
import redis from "../../libs/redis";
import getBookmark from "@/app/actions/bookmarkActions/getBookmark";
import deleteBookmark from "@/app/actions/bookmarkActions/deleteBookmark";
import addBookmark from "@/app/actions/bookmarkActions/addBookmark";
import { handleError } from "@/app/utils/errorHandler";

import getAllBookmarks from "@/app/actions/bookmarkActions/getAllBookmarks";
import getBookmarksFromCollection from "@/app/actions/bookmarkActions/getBookmarksFromCollection";
import getBookmarksFromTagId from "@/app/actions/bookmarkActions/getBookmarksFromTagId";
import getBookmarksFromSearch from "@/app/actions/bookmarkActions/getBookmarksFromSearch";
import { FullBookmarkType } from "@/app/types";
import { BadRequestError } from "@/app/libs/errors";
import { encrypt } from "@/app/libs/encryption";

async function fetchData(
  sessionToken: string,
  page_url: string,
  collectionId: string,
  tagId: string,
  searchQuery: string
): Promise<FullBookmarkType | FullBookmarkType[] | null> {
  if (collectionId && !searchQuery) {
    return await getBookmarksFromCollection(sessionToken, collectionId);
  } else if (page_url) {
    return await getBookmark(sessionToken, page_url);
  } else if (tagId) {
    return await getBookmarksFromTagId(sessionToken, tagId);
  } else if (searchQuery) {
    return await getBookmarksFromSearch(
      sessionToken,
      searchQuery,
      collectionId
    );
  }
  return await getAllBookmarks(sessionToken);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionToken =
      req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, page_url, note, excerpt, collection_name } = body;
    const sessionToken =
      req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";

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

export async function PATCH(req: any) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      note,
      collectionId,
      collection_name,
      tags,
      page_url,
      excerpt,
      favIconUrl,
    } = body;
    if (!id) {
      throw new BadRequestError(
        "Failed to schedule Bookmark update. Missing required field: id."
      );
    }

    // Encrypt session token to validate aggregate changes
    const sessionToken =
      req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const encryptedSessionToken = encrypt(sessionToken);

    // Create a unique key for Redis storage
    const redisKey = `bookmark:update:${id}:${encryptedSessionToken}`;
    await Promise.all(
      [
        title !== undefined && redis.hset(redisKey, "title", title),
        note !== undefined && redis.hset(redisKey, "note", note),
        collectionId !== undefined &&
          redis.hset(redisKey, "collectionId", collectionId),
        collection_name !== undefined &&
          redis.hset(redisKey, "collection_name", collection_name),
        tags !== undefined &&
          redis.hset(redisKey, "tags", JSON.stringify(tags)),
        page_url !== undefined && redis.hset(redisKey, "page_url", page_url),
        excerpt !== undefined && redis.hset(redisKey, "excerpt", excerpt),
        favIconUrl !== undefined &&
          redis.hset(redisKey, "favIconUrl", favIconUrl),
      ].filter(Boolean)
    );
    await redis.expire(redisKey, 3600); // Set expiry to 1 hour

    return NextResponse.json({
      success: true,
      data: "Bookmark update scheduled",
    });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    const sessionToken =
      req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";

    const deletedBookmark = await deleteBookmark(sessionToken, id);

    return NextResponse.json({ success: true, data: deletedBookmark });
  } catch (error) {
    return handleError(error as Error);
  }
}
