interface Session {
  userId: string;
  sessionToken: string;
  id: string;
  expires: number;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const apiFetchSession = async (
  sessionToken: string
): Promise<APIResponse<Session> | null> => {
  if (!sessionToken) {
    throw new Error("Session token is required!");
  }

  const url = `http://localhost:3000/api/session?sessionToken=${sessionToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = (await response.json()) as APIResponse<Session>;
  if (!data.success) {
    throw new Error(data.error || "Unknown error occurred");
  }

  return data;
};

export default apiFetchSession;
