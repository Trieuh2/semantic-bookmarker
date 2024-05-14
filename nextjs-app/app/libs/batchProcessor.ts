import updateBookmark from "../actions/bookmarkActions/updateBookmark";
import { decrypt } from "./encryption";
import redis from "./redis";

async function processBatchUpdates(): Promise<void> {
  let cursor = "0";
  do {
    try {
      const reply = await redis.scan(
        cursor,
        "MATCH",
        "bookmark:update:*",
        "COUNT",
        100
      );
      cursor = reply[0];
      const keys = reply[1];

      for (const key of keys) {
        const changes = await redis.hgetall(key);
        if (Object.keys(changes).length > 0) {
          // Pattern is "recordType : actionType : recordId : iv : encryptedToken"
          const id = key.split(":")[2];
          const iv = key.split(":")[3];
          const encryptedToken = key.split(":")[4];

          const sessionToken = decrypt(iv + ":" + encryptedToken);
          const {
            title,
            note,
            collectionId,
            collection_name,
            tags,
            page_url,
            excerpt,
            favIconUrl,
          } = changes;

          await updateBookmark(
            sessionToken,
            id,
            title,
            note,
            collectionId,
            collection_name,
            tags ? JSON.parse(tags) : undefined,
            page_url,
            excerpt,
            favIconUrl
          );
          await redis.del(key);
          console.log(`Performed update for bookmark ID: ${id}`);
        }
      }
    } catch (error) {
      console.error("Failed to process batch update:", error);
    }
  } while (cursor !== "0");
}

export default processBatchUpdates;
