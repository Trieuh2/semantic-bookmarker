interface UrlInfo {
  directory: "bookmarks" | "collections" | "tags";
  subdirectory: "" | "search" | any;
  id: string;
}

export const getUrlInfo = (pathname: string): UrlInfo => {
  const pathSegments = pathname.split("/");
  const directory = pathSegments[2] as "bookmarks" | "collections" | "tags";

  if (directory === "bookmarks") {
    // Example:
    // pathname = "/home/bookmarks/search"
    //    directory     = "bookmarks"
    //    subdirectory  = "search"
    //    id            = ""
    const subdirectory = pathSegments[3];

    return {
      directory,
      subdirectory,
      id: "",
    };
  } else {
    // Example:
    // pathname = "/home/tags/662e9483ac493a92b89240c8"
    //    directory     = "tags"
    //    subdirectory  = "search"
    //    id            = "662e9483ac493a92b89240c8"
    const id = pathSegments[3];
    const subdirectory = pathSegments[4] ?? "";
    return {
      directory,
      subdirectory,
      id,
    };
  }
};

export const getDomainNameFromPageUrl = (page_url: string) => {
  try {
    const url = new URL(page_url);
    const urlHostName = url.hostname;
    return urlHostName.replace("www.", "");
  } catch (error) {
    console.error("Error parsing hostName from page_url", error);
    return "";
  }
};