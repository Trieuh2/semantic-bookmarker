import { NextResponse } from "next/server";
import createTag from "@/app/actions/tagActions/createTag";
import { handleError } from "@/app/utils/errorHandler";
import getAllTags from "@/app/actions/tagActions/getAllTags";
import deleteTag from "@/app/actions/tagActions/deleteTag";
import updateTag from "@/app/actions/tagActions/updateTag";

export async function GET(request: Request) {
  try {
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const tags = await getAllTags(sessionToken);

    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    handleError(error as Error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const tag = await createTag(sessionToken, name);
    
    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    handleError(error as Error);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";

    const deletedTag = await deleteTag(sessionToken, id);

    return NextResponse.json({ success: true, data: deletedTag });
  } catch (error) {
    handleError(error as Error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name } = body;

    const sessionToken =
      request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";

    const updatedTag = await updateTag(sessionToken, id, name);

    return NextResponse.json({ success: true, data: updatedTag });
  } catch (error) {
    handleError(error as Error);
  }
}
