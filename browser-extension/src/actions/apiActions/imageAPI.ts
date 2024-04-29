const apiUploadImage = async (
  sessionToken: string,
  bookmarkId: string,
  imageSrc: string,
  imageType: "favIcon" | "screenshot"
) => {
  if (!sessionToken || !bookmarkId || !imageSrc || !imageType) {
    throw new Error(
      "Error fetching collections. Missing required fields: sessionToken, bookmarkId, imageSrc, imageType"
    );
  }

  const postData = {
    bookmarkId,
    imageSrc,
    imageType,
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

export default apiUploadImage;
