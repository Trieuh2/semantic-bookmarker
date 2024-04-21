import prisma from "@/app/libs/prismadb";
import getUserIdFromSessionToken from "./getUserIdFromSessionToken";
import { Bookmark, Tag } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../libs/errors";
import getIsSessionValid from "./getIsSessionValid";
import createOrFetchCollection from "./createOrFetchCollection";

const updateBookmark = async (
  sessionToken: string,
  id: string,
  title?: string,
  note?: string,
  collection_name?: string,
  tags?: string[],
  page_url?: string,
  excerpt?: string
): Promise<Bookmark> => {
  if (!sessionToken || !id) {
    throw new BadRequestError("Missing required fields (sessionToken, id)");
  }

  // Validate session
  if (!(await getIsSessionValid(sessionToken))) {
    throw new UnauthorizedError(
      "Failed to update Bookmark record. Invalid or expired session."
    );
  }

  // Check if the bookmark exists before deletion to handle not found error gracefully
  const bookmark = await prisma.bookmark.findUnique({
    where: { id },
  });

  if (!bookmark) {
    throw new NotFoundError(
      "Failed to update Bookmark. Bookmark record not found."
    );
  }

  // Check if there are any valid fields to update
  const validFields: (keyof typeof potentialUpdates)[] = [
    "title",
    "note",
    "collection_name",
    "page_url",
    "excerpt",
  ];
  const potentialUpdates: {
    title?: string;
    note?: string;
    collection_name?: string;
    page_url?: string;
    excerpt?: string;
  } = { title, note, collection_name, page_url, excerpt };
  const updates = validFields
    .filter((field) => potentialUpdates[field] != null)
    .reduce(
      (acc, field) => ({ ...acc, [field]: potentialUpdates[field] }),
      {} as typeof potentialUpdates
    );

  // Handle Tags and TagToBookmark updates
  if (tags && tags.length) {
    const tagsUpdate = await updateTagsAndTagToBookmarks(
      sessionToken,
      tags,
      id
    );

    if (!tagsUpdate) {
      throw new Error(
        "Failed to create/update Tag and TagToBookmarks associated with this Bookmark record."
      );
    }
  }

  // Ensure the collection is also created
  if (collection_name) {
    const userId = await getUserIdFromSessionToken(sessionToken);
    await createOrFetchCollection(userId, collection_name ?? "Unsorted");
  }
  const updatedBookmark = await prisma.bookmark.update({
    where: { id },
    data: { ...updates },
  });

  if (!updatedBookmark) {
    throw new Error("Failed to update Bookmark record.");
  }

  return updatedBookmark;
};

const updateTagsAndTagToBookmarks = async (
  sessionToken: string,
  tagNames: string[],
  id: string
) => {
  // Create or fetch tags
  const userId = await getUserIdFromSessionToken(sessionToken);

  const updatedTags = await updateTags(userId ?? "", tagNames);
  if (!updatedTags) {
    throw new Error("Failed to update tag for Bookmark record.");
  }

  // Create TagToBookmark records
  const processedTags = updatedTags;
  const updatedTagToBookmarks = await updateTagToBookmarks(
    userId,
    id,
    processedTags
  );
  return { updatedTags, updatedTagToBookmarks };
};

const updateTags = async (userId: string, tagNames: string[]) => {
  if (!userId || !tagNames) {
    throw new BadRequestError(
      "Failed to update tags associated with Bookmark record. Missing userId or tagNames."
    );
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
      throw new Error("Error encountered while fetching Tags.");
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
      throw new Error("Error encountered during Tag creation process.");
    }
  }

  return resultingTags;
};

const updateTagToBookmarks = async (
  userId: string,
  id: string,
  tags: Tag[]
) => {
  if (!userId || !id || !tags) {
    throw new BadRequestError(
      "Error creating TagToBookmark record. Missing userId, id, or tags parameters."
    );
  }

  // Fetch bookmark
  const bookmark = await prisma.bookmark.findFirst({
    where: {
      userId,
      id,
    },
  });

  if (!bookmark) {
    throw new NotFoundError(
      "Error creating TagToBookmark record. Associated bookmark record not found."
    );
  }

  try {
    // Fetch existing TagToBookmark records
    const inputTagIds = tags.map((tag) => tag.id);
    const tagToBookmarks = await prisma.tagToBookmark.findMany({
      where: {
        userId,
        page_url: bookmark?.page_url,
      },
    });

    const existingTagToBookmark_TagIds = tagToBookmarks.map(
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

      tagToBookmarks.push(newTagToBookmark);
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
      throw new Error("Failed to delete TagToBookmark record.");
    }

    return tagToBookmarks;
  } catch (error) {
    throw new Error("Failed to update TagToBookmark records.");
  }
};

export { updateBookmark };
