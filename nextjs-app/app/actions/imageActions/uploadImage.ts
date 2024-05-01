import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/app/libs/errors";
import getIsSessionValid from "../sessionActions/getIsSessionValid";
import cloudinary from "@/app/libs/cloudinarydb";
import getUserIdFromSessionToken from "../sessionActions/getUserIdFromSessionToken";

const uploadImage = async (
  sessionToken: string,
  imageSrc: string,
  imageType: "favIcon" | "screenshot",
  domainName: string,
  bookmarkId: string
) => {
  if (!sessionToken || !imageSrc || !imageType || !domainName || !bookmarkId) {
    throw new BadRequestError(
      "Failed to upload Image. Missing required fields: sessionToken, imageSrc, imageType, domainName, bookmarkId."
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

  const userId = await getUserIdFromSessionToken(sessionToken);
  const public_id = `${userId}-${domainName}-${imageType}`;

  const options = {
    public_id,
    display_name: domainName,
    folder: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_FOLDER,
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
