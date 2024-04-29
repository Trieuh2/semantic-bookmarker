import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/app/libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import cloudinary from "@/app/libs/cloudinarydb";

const uploadImage = async (
  sessionToken: string,
  bookmarkId: string,
  imageSrc: string,
  imageType: "favIcon" | "screenshot"
) => {
  if (!sessionToken || !bookmarkId || !imageSrc || !imageType) {
    throw new BadRequestError(
      "Failed to upload Image. Missing required fields: sessionToken, bookmarkId, imageSrc, imageType."
    );
  }

  if (!(await getIsSessionValid(sessionToken))) {
    throw new UnauthorizedError(
      "Failed to upload Image. Invalid or expired session."
    );
  }

  const bookmark = await prisma?.bookmark.findUnique({
    where: {
      id: bookmarkId,
    },
  });

  if (!bookmark) {
    throw new NotFoundError(
      "Failed to upload Image. A bookmark record does not exist for the given bookmarkId."
    );
  }

  const public_id = `bookmark-${bookmarkId}-${imageType}`;
  const options = {
    public_id,
    display_name: bookmark.title,
    folder: "semantic-bookmarker",
    use_filename: false,
    unique_filename: false,
    overwrite: true,
  };

  const image = await cloudinary.uploader.upload(imageSrc, options);

  if (!image) {
    throw new Error("Failed to upload Image. Internal server error.");
  }
  return image;
};

export default uploadImage;
