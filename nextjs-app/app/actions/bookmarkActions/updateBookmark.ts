import prisma from "@/app/libs/prismadb";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";
import { Bookmark, Tag } from "@prisma/client";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import createOrFetchCollection from "../collectionActions/createOrFetchCollection";

interface Updates {
  [key: string]: string | undefined;
  title?: string;
  note?: string;
  collectionId?: string;
  page_url?: string;
  excerpt?: string;
  favIconUrl?: string;
}

const updateBookmark = async (
  sessionToken: string,
  id: string,
  title?: string,
  note?: string,
  collectionId?: string,
  collection_name?: string,
  tags?: string[],
  page_url?: string,
  excerpt?: string,
  favIconUrl?: string
): Promise<Bookmark> => {
  if (!sessionToken || !id) {
    throw new BadRequestError(
      "Error updating Bookmark record. Missing required fields (sessionToken, id)"
    );
  }

  // Validate session
  if (!(await getIsSessionValid(sessionToken))) {
    throw new UnauthorizedError(
      "Error updating Bookmark record. Invalid or expired session."
    );
  }

  // Check if the bookmark exists before deletion to handle not found error gracefully
  const bookmark = await prisma.bookmark.findUnique({ where: { id } });
  if (!bookmark) {
    throw new NotFoundError(
      "Error updating Bookmark record. Bookmark record not found."
    );
  }

  const potentialUpdates: Updates = {
    title,
    note,
    collectionId,
    page_url,
    excerpt,
    favIconUrl,
  };

  // Only include non-undefined values in the updates
  const updates = Object.entries(potentialUpdates).reduce<Updates>(
    (acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    },
    {}
  );

  // Handle Tags and TagToBookmark updates
  if (tags) {
    const { updatedTags, updatedTagToBookmarks } =
      await updateTagsAndTagToBookmarks(sessionToken, tags, id);
  }

  // Ensure the collection is also created
  if (collection_name && !collectionId) {
    const collection = await createOrFetchCollection(
      sessionToken,
      collection_name ?? "Unsorted"
    );
    updates["collectionId"] = collection.id;
  }

  const updatedBookmark = await prisma.bookmark.update({
    where: { id },
    data: { ...updates },
    include: {
      tagToBookmarks: {
        include: {
          tag: {
            include: {
              _count: {
                select: { tagToBookmarks: true },
              },
            },
          },
        },
      },
    },
  });

  if (!updatedBookmark) {
    throw new Error("Error updating Bookmark record. Internal Server Error.");
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
    throw new Error(
      "Error updating Bookmark record. Failed to update tag for Bookmark record."
    );
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
  if (!userId || tagNames === undefined) {
    throw new BadRequestError(
      "Error updating Bookmark record. Failed to update associated tags due to missing userId or tagNames."
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
      throw new Error(
        "Error updating Bookmark record. Error encountered while fetching Tags."
      );
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
      throw new Error(
        "Error updating Bookmark record. Error encountered creating associated Tag record."
      );
    }
  }

  return resultingTags;
};

const updateTagToBookmarks = async (
  userId: string,
  id: string,
  tags: Tag[]
) => {
  if (!userId || !id || tags === undefined) {
    throw new BadRequestError(
      "Error updating Bookmark record. Error creating TagToBookmark associated record. Missing userId, id, or tags parameters."
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
      "Error updating Bookmark record. Error creating TagToBookmark record. Associated bookmark record not found."
    );
  }

  try {
    // Fetch existing TagToBookmark records
    const inputTagIds = tags.map((tag) => tag.id);
    const tagToBookmarks = await prisma.tagToBookmark.findMany({
      where: {
        userId,
        bookmarkId: bookmark?.id,
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
          bookmarkId: id,
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
          bookmarkId: id,
        },
      });
    } catch (error) {
      throw new Error(
        "Error updating Bookmark record. Failed to delete associated TagToBookmark record."
      );
    }
    return tagToBookmarks;
  } catch (error) {
    throw new Error(
      "Error updating Bookmark record. Failed to update TagToBookmark records."
    );
  }
};

export default updateBookmark;
