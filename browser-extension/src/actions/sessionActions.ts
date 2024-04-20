import apiFetchSession from "./apiActions/sessionAPI";

export const fetchSession = async (sessionToken: string) => {
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
