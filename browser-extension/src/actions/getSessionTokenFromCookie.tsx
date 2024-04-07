import getCookie from "./getCookie";

// Retrieves the session token value from the cookie stored in the local browser
const getSessionTokenFromCookie = async () => {
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

export default getSessionTokenFromCookie;
