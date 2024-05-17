import { NextResponse } from "next/server";
import { handleError } from "@/app/utils/errorHandler";
import { performSemanticMatchingViaUSE } from "@/app/actions/embeddingActions/performSemanticMatchingViaUSE";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookmarks, collection_names } = body;
    const sessionToken =
      req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";

    const embeddings = await performSemanticMatchingViaUSE(
      sessionToken,
      bookmarks,
      collection_names
    );
    return NextResponse.json({
      success: true,
      data: Object.fromEntries(embeddings),
    });
  } catch (error) {
    handleError(error as Error);
  }
}
