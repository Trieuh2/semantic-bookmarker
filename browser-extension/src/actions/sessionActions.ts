import apiFetchSession from "./apiActions/sessionAPI";

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
    const url = "http://localhost:3000/api/session";
    const postData = {
      sessionToken: sessionToken,
    };
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to sign out of current session:", error);
    throw error;
  }
};

export { fetchSession, deleteSession };
