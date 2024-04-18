import getCurrentUser from "./getCurrentUser";

const getUserIdFromUserSession = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return "";
  } else {
    return currentUser.id;
  }
};

export default getUserIdFromUserSession;
