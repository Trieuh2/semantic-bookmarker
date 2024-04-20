export const getCookie = async () => {
  try {
    const cookie = await chrome.cookies.get({
      url: "http://localhost:3000",
      name: "next-auth.session-token",
    });
    return cookie;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Retrieves the session token value from the cookie stored in the local browser
export const getSessionTokenFromCookie = async () => {
  try {
    const cookie = await getCookie();
    if (cookie && cookie?.value) {
      return cookie.value;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};
