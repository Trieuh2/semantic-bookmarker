// import deleteImage from "@/app/actions/imageActions/deleteImage";
import uploadImage from "@/app/actions/imageActions/uploadImage";
import { handleError } from "@/app/utils/errorHandler";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { imageSrc, imageType, domainName, bookmarkId } = body;

    const image = await uploadImage(
      sessionToken,
      imageSrc,
      imageType,
      domainName,
      bookmarkId
    );

    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    handleError(error as Error);
  }
}

// export async function DELETE(request: Request) {
//   try {
//     const body = await request.json();
//     const sessionToken =
//       request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
//     const { imageType, bookmarkId } = body;

//     const result = await deleteImage(sessionToken, bookmarkId, imageType);

//     return NextResponse.json({ success: true, data: result });
//   } catch (error) {
//     handleError(error as Error);
//   }
// }
