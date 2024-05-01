const apiUploadFavIcon = async (
  sessionToken: string,
  imageSrc: string,
  imageType: "favIcon" | "screenshot",
  domainName: string,
  bookmarkId: string
) => {
  if (!sessionToken || !imageSrc || !imageType || !domainName || !bookmarkId) {
    throw new Error(
      "Failed to upload Image. Missing required fields: sessionToken, imageSrc, imageType, domainName, bookmarkId."
    );
  }

  const postData = {
    imageSrc,
    imageType,
    domainName,
    bookmarkId,
  };

  const url = "http://localhost:3000/api/image";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Unknown error occurred");
  }

  return data;
};

export default apiUploadFavIcon;
