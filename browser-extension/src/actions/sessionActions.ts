import { apiFetchSession, apiDeleteSession } from "./apiActions/sessionAPI";

const fetchSession = async (sessionToken: string) => {
  try {
    const response = await apiFetchSession(sessionToken);
    if (response && response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      "Error fetching session record:",
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
    return null;
  }
};

const deleteSession = async (sessionToken: string) => {
  try {
    const response = await apiDeleteSession(sessionToken);
    if (response && response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      "Error deleting session record:",
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
    return null;
  }
};

export { fetchSession, deleteSession };
