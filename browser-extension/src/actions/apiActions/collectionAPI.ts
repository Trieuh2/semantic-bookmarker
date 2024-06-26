import { APIResponse, Collection } from "../../types";

const apiFetchCollections = async (
  sessionToken: string
): Promise<APIResponse<Collection[]> | null> => {
  if (!sessionToken) {
    throw new Error("Error fetching collections. Missing sessionToken");
  }

  const url = "http://localhost:3000/api/collection";
  const response = await fetch(url, {
    headers: {
      method: "GET",
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as APIResponse<Collection[]>;
  if (!data.success) {
    throw new Error(data.error || "Unknown error occurred");
  }

  return data;
};

export default apiFetchCollections;
