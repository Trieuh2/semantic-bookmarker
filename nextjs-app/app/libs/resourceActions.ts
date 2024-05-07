import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { CollectionWithBookmarkCount, TagWithBookmarkCount } from "../types";

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
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  try {
    await axios.patch(`/api/${endpoint}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    onSuccess();
  } catch (error) {
    onError(error);
  }
};

export const axiosCreateResource = async (
  endpoint: string,
  data: Record<string, any> = {},
  sessionToken: string,
  onSuccess: (
    newResource: CollectionWithBookmarkCount | TagWithBookmarkCount
  ) => void,
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
  resourceType: "collection" | "tag",
  name: string,
  parentId?: string // nested collection parent id
): CollectionWithBookmarkCount | TagWithBookmarkCount => {
  let tempResource:
    | CollectionWithBookmarkCount
    | TagWithBookmarkCount
    | undefined;
  const randomObjectId = uuidv4();

  if (resourceType === "collection") {
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
  } else if (resourceType === "tag") {
    tempResource = {
      id: randomObjectId,
      createdAt: new Date(),
      name: name,
      userId: userId ?? "",
      _count: {
        tagToBookmarks: 0,
      },
    } as TagWithBookmarkCount;
  }

  if (tempResource === undefined) {
    throw new Error("tempResource was not assigned a value");
  }

  return tempResource;
};
