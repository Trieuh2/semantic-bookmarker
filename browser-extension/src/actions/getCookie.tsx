const getCookie = async () => {
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

export default getCookie;
