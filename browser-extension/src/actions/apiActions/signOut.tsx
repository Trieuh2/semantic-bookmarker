const signOut = async (sessionToken: string) => {
  try {
    const url = "http://localhost:3000/api/auth/signout";
    const postData = {
      sessionToken: sessionToken,
    };
    const response = await fetch(url, {
      method: "POST",
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

export default signOut;
