// import {
//   BadRequestError,
//   NotFoundError,
//   UnauthorizedError,
// } from "@/app/libs/errors";
// import getIsSessionValid from "../sessionActions/getIsSessionValid";
// import cloudinary from "@/app/libs/cloudinarydb";

// const deleteImage = async (
//   sessionToken: string,
//   bookmarkId: string,
//   imageType: "favIcon" | "screenshot"
// ) => {
//   if (!sessionToken || !imageType || !bookmarkId) {
//     throw new BadRequestError(
//       "Failed to delete Image. Missing required fields: sessionToken, bookmarkId, imageType."
//     );
//   }

//   if (!(await getIsSessionValid(sessionToken))) {
//     throw new UnauthorizedError(
//       "Failed to delete Image. Invalid or expired session."
//     );
//   }

//   const bookmark = await prisma?.bookmark.findUnique({
//     where: {
//       id: bookmarkId,
//     },
//   });

//   if (!bookmark) {
//     throw new NotFoundError(
//       "Failed to delete Image. A bookmark record does not exist for the given bookmarkId."
//     );
//   }

//   const public_id = `semantic-bookmarker/bookmark-${bookmarkId}-${imageType}`;
//   const options = {
//     invalidate: true,
//   };

//   const result = await cloudinary.uploader.destroy(public_id, options);

//   if (!result) {
//     throw new Error("Failed to delete Image. Internal server error.");
//   }
//   return result;
// };

// export default deleteImage;
