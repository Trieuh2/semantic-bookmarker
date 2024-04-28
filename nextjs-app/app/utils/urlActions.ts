export const getUrlInfo = (pathname: string) => {
  const pathSegments = pathname.split("/");
  const directory = pathSegments[2];

  if (directory === "bookmarks") {
    const subdirectory = pathSegments[3]; // collectionId, tagId, or 'search (from '/home/bookmarks/search')'

    return {
      directory,
      subdirectory,
      id: "",
    };
  } else {
    const id = pathSegments[3]; // collectionId, tagId
    const subdirectory = pathSegments[4] ?? "";
    return {
      directory,
      subdirectory,
      id,
    };
  }
};
