import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getBookmarkRecord from "@/app/actions/getBookmarkRecord";
import getIsSessionValid from "@/app/actions/getIsSessionValid";
import getUserIdFromSessionToken from "@/app/actions/getUserIdFromSessionToken";
import { Tag } from "@prisma/client";

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

    const isSessionValid = await getIsSessionValid(sessionToken);

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
    const { id, sessionToken, tags, ...potentialUpdates } = body;

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
