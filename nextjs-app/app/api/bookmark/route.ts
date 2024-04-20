import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getIsSessionValid from "@/app/actions/getIsSessionValid";
import getUserIdFromSessionToken from "@/app/actions/getUserIdFromSessionToken";
import { Collection, Tag } from "@prisma/client";
import getBookmark from "@/app/actions/getBookmark";
import deleteBookmark from "@/app/actions/deleteBookmark";
import addBookmark from "@/app/actions/addBookmark";
import { BadRequestError, NotFoundError } from "@/app/libs/errors";
import { handleError } from "@/app/utils/errorHandler";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") ?? "";
    const sessionToken = url.searchParams.get("sessionToken") ?? "";
    const page_url = url.searchParams.get("page_url") ?? "";

    const bookmark = await getBookmark(userId, sessionToken, page_url);

    return NextResponse.json({ success: true, data: bookmark });
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

// TODO: Separate API layer and business layer
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, sessionToken, tags, collection_name, ...potentialUpdates } =
      body;

    // Validate session
    if (!(await getIsSessionValid(sessionToken))) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Validate parameters
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

    // Handle missing fields case
    if (Object.keys(body).length === 2) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "No fields provided for updating Bookmark record.",
        },
        { status: 400 }
      );
    }

    // Check if there are any valid fields to update
    const validFields = [
      "title",
      "page_url",
      "note",
      "excerpt",
      "collection_name",
    ];
    const updates = Object.keys(potentialUpdates)
      .filter(
        (field) =>
          validFields.includes(field) && potentialUpdates[field] != null
      )
      .reduce(
        (acc, field) => ({ ...acc, [field]: potentialUpdates[field] }),
        {}
      );

    // Handle Tags and TagToBookmark updates
    if (tags) {
      const tagsUpdate = await updateTagsAndTagToBookmarks(
        sessionToken,
        tags,
        id
      );

      if (tagsUpdate.status !== 200) {
        return NextResponse.json({
          status: tagsUpdate.status,
          error: tagsUpdate.error,
        });
      }
    }

    // Fetch collectionId
    const collection = await updateCollection(sessionToken, collection_name);

    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: { ...updates, collection_name: collection?.name ?? "" },
    });

    return NextResponse.json(updatedBookmark);
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

const updateTagsAndTagToBookmarks = async (
  sessionToken: string,
  tagNames: string[],
  id: string
) => {
  try {
    // Create or fetch tags
    const userIdFetchResponse = await getUserIdFromSessionToken(sessionToken);
    if (userIdFetchResponse.status !== 200) {
      return {
        status: userIdFetchResponse.status,
        error: userIdFetchResponse.error,
      };
    }
    const userId = userIdFetchResponse.data;

    const processTagResponse = await updateTags(userId ?? "", tagNames);
    if (processTagResponse.status !== 200) {
      return {
        status: processTagResponse.status,
        error: processTagResponse.error,
      };
    }

    // Create TagToBookmark records
    const processedTags = processTagResponse.data;
    const tagToBookmarkResponse = await updateTagToBookmarks(
      userId ?? "",
      id,
      processedTags ?? []
    );

    if (tagToBookmarkResponse.status !== 200) {
      return {
        status: tagToBookmarkResponse.status,
        error: tagToBookmarkResponse.error,
      };
    }

    return { status: 200, data: tagToBookmarkResponse.data };
  } catch (error) {
    return { status: 500, error: "Internal Server Error" };
  }
};

const updateTags = async (userId: string, tagNames: string[]) => {
  if (!userId || !tagNames) {
    return { status: 400, error: "Missing userId or tagNames" };
  }

  const resultingTags = [];
  const tagsToCreate = [];

  // Find existing and missing tags
  for (const tagName of tagNames) {
    try {
      const tagRecord = await prisma.tag.findFirst({
        where: {
          name: tagName,
          userId,
        },
      });

      if (!tagRecord) {
        tagsToCreate.push(tagName);
      } else {
        resultingTags.push(tagRecord);
      }
    } catch (error) {
      console.log("Error encountered while fetching Tags");
      return { status: 500, error: "Internal Server Error" };
    }
  }

  // Create the missing tags
  for (const tagName of tagsToCreate) {
    try {
      const newTagRecord = await prisma.tag.create({
        data: {
          userId,
          name: tagName,
        },
      });
      resultingTags.push(newTagRecord);
    } catch (error) {
      console.log("Error encountered during Tag creation process.");
      ({ status: 500, error: "Internal Server Error" });
    }
  }

  return { status: 200, data: resultingTags ?? [] };
};

const updateTagToBookmarks = async (
  userId: string,
  id: string,
  tags: Tag[]
) => {
  if (!userId || !id || !tags) {
    return {
      status: 400,
      error:
        "Error creating TagToBookmark record. Missing userId, id, or tags parameters.",
    };
  }

  // Fetch bookmark
  const bookmark = await prisma.bookmark.findFirst({
    where: {
      userId,
      id,
    },
  });

  if (!bookmark) {
    return {
      status: 404,
      error: "Error creating TagToBookmark record. Bookmark not found.",
    };
  }

  try {
    const inputTagIds = tags.map((tag) => tag.id);
    const existingTagToBookmarks = await prisma.tagToBookmark.findMany({
      where: {
        userId,
        page_url: bookmark?.page_url,
      },
    });

    const existingTagToBookmark_TagIds = existingTagToBookmarks.map(
      (record) => record.tagId
    );

    // Create new TagToBookmark records
    const tagIdsForCreation = inputTagIds.filter(
      (tagId) => !existingTagToBookmark_TagIds.includes(tagId)
    );
    const tagsUsedForCreation = tags.filter((tag) =>
      tagIdsForCreation.includes(tag.id)
    );

    for (const tagRecord of tagsUsedForCreation) {
      const newTagToBookmark = await prisma.tagToBookmark.create({
        data: {
          tagId: tagRecord.id,
          tag_name: tagRecord.name,
          bookmarkId: id,
          page_url: bookmark.page_url,
          userId,
        },
      });

      existingTagToBookmarks.push(newTagToBookmark);
    }

    // Delete old TagToBookmark records
    const tagIdsForDeletion = existingTagToBookmark_TagIds.filter(
      (tagId) => !inputTagIds.includes(tagId)
    );
    try {
      await prisma.tagToBookmark.deleteMany({
        where: {
          userId,
          tagId: {
            in: tagIdsForDeletion,
          },
        },
      });
    } catch (error) {
      return { status: 500, error: "Internal Server Error." };
    }

    return { status: 200, data: existingTagToBookmarks };
  } catch (error) {
    return {
      status: 500,
      error: "Internal Server Error",
    };
  }
};

const updateCollection = async (
  sessionToken: string,
  collection_name: string
) => {
  if (!sessionToken || !collection_name) {
    throw new BadRequestError("Missing sessionToken or collection_name.");
  }
  const userIdFetchResponse = await getUserIdFromSessionToken(sessionToken);

  if (userIdFetchResponse.status !== 200) {
    throw new BadRequestError("Error fetching userId from session token.");
  }
  const userId = userIdFetchResponse.data;

  const collection = await createOrFetchCollection(
    userId ?? "",
    collection_name
  );

  if (collection) {
    return collection;
  } else {
    throw new NotFoundError("Error creating or fetching collection.");
  }
};

const createOrFetchCollection = async (
  userId: string,
  collection_name: string
): Promise<Collection> => {
  if (!userId || !collection_name) {
    throw new BadRequestError("Missing required userId or collection_name.");
  }

  const collection = await prisma.collection.findFirst({
    where: {
      userId,
      name: collection_name,
    },
  });

  if (!collection) {
    const newCollection = await prisma.collection.create({
      data: {
        userId,
        name: collection_name,
      },
    });
    return newCollection;
  }
  return collection;
};
