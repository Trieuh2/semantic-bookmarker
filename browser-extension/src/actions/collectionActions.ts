import apiFetchCollections from "./apiActions/collectionAPI";

export const fetchCollections = async (
  sessionToken: string
) => {
  try {
    const response = await apiFetchCollections(sessionToken);

    if (response && response.success) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      "Error fetching collection records:",
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
    return null;
  }
};
