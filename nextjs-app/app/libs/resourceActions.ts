import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  CollectionWithBookmarkCount,
  FullBookmarkType,
  TagToBookmarkWithTag,
  TagWithBookmarkCount,
} from "../types";

const validEndpoints = ["bookmark", "collection", "tag"];

export const axiosFetchResource = async (
  endpoint: string,
  sessionToken: string,
  params: Record<string, any> = {}
) => {
  try {
    if (!validEndpoints.includes(endpoint)) {
      throw new Error("Invalid endpoint");
    }

    const response = await axios.get(`http://localhost:3000/api/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      params: params,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}: `, error);
    return null;
  }
};

export const axiosDeleteResource = async (
  endpoint: string,
  identifier: string,
  sessionToken: string,
  onSuccess: (type: string, identifier: string) => void,
  onError: (error: any) => void
) => {
  try {
    await axios.delete(`/api/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      data: { id: identifier },
    });
    onSuccess(endpoint, identifier);
  } catch (error) {
    onError(error);
  }
};

export const axiosUpdateResource = async (
  endpoint: string,
  data: Record<string, any> = {},
  sessionToken: string,
  onSuccess:
    | ((updatedActiveBookmark?: FullBookmarkType) => void)
    | (() => void),
  onError: (error: any) => void
): Promise<void> => {
  try {
    const response = await axios.patch(`/api/${endpoint}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (onSuccess.length === 0) {
      onSuccess();
    } else if (onSuccess.length === 1 && response.data.data) {
      onSuccess(response.data.data as FullBookmarkType);
    }
  } catch (error) {
    onError(error);
  }
};

export const axiosCreateResource = async (
  endpoint: string,
  data: Record<string, any> = {},
  sessionToken: string,
  onSuccess: (newResource: any) => void,
  onError: (error: any) => void
) => {
  try {
    const response = await axios.post(`/api/${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    onSuccess(response.data.data);
  } catch (error) {
    onError(error);
  }
};

export const createTempResource = (
  userId: string,
  resourceType: "collection" | "tag" | "tagToBookmark",
  name: string,
  parentId?: string, // nested collection parent id
  tagToBookmarksCount?: number,
  tag?: TagWithBookmarkCount
):
  | CollectionWithBookmarkCount
  | TagWithBookmarkCount
  | TagToBookmarkWithTag => {
  let tempResource:
    | CollectionWithBookmarkCount
    | TagWithBookmarkCount
    | TagToBookmarkWithTag
    | undefined;
  const randomObjectId = uuidv4() + "temp";

  switch (resourceType) {
    case "collection":
      tempResource = {
        id: randomObjectId,
        createdAt: new Date(),
        name: name,
        isDefault: false,
        userId: userId ?? "",
        parentId: parentId,
        _count: {
          bookmarks: 0,
        },
      } as CollectionWithBookmarkCount;
      break;
    case "tag":
      tempResource = {
        id: randomObjectId,
        createdAt: new Date(),
        name: name,
        userId: userId ?? "",
        _count: {
          tagToBookmarks: tagToBookmarksCount ?? 0,
        },
      } as TagWithBookmarkCount;
      break;
    case "tagToBookmark":
      tempResource = {
        id: randomObjectId,
        createdAt: new Date(),
        tagId: randomObjectId,
        bookmarkId: "",
        userId: userId ?? "",
        tag: {
          id: randomObjectId,
          createdAt: new Date(),
          name: name,
          userId: userId ?? "",
        },
      } as TagToBookmarkWithTag;

      if (tag) {
        tempResource = { ...tempResource, tagId: tag.id, tag };
      }
      break;
  }

  if (tempResource === undefined) {
    throw new Error("tempResource was not assigned a value");
  }

  return tempResource;
};
