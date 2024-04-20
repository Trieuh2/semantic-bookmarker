interface Collection {
  id: string;
  createdAt: string;
  name: string;
  userId: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const apiFetchCollections = async (
  userId: string,
  sessionToken: string
): Promise<APIResponse<Collection[]> | null> => {
  if (!userId || !sessionToken) {
    throw new Error("All parameters (userId, sessionToken) are required");
  }

  const base_url = "http://localhost:3000/api/collection";
  const params = {
    userId: userId,
    sessionToken: sessionToken,
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `${base_url}?${queryString}`;
  const response = await fetch(url);

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
