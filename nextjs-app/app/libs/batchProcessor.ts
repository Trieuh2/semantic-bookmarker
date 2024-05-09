import updateBookmark from "../actions/bookmarkActions/updateBookmark";
import { decrypt } from "./encryption";
import redis from "./redis";

async function processBatchUpdates(): Promise<void> {
  // recordType : actionType : recordId : iv : encryptedToken
  const keysPattern = "bookmark:update:*:*:*";
  const keys = await redis.keys(keysPattern);

  for (const key of keys) {
    const changes = await redis.hgetall(key); // Get all fields for the key

    if (Object.keys(changes).length > 0) {
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
      await redis.del(key); // Clear the Redis entry after processing

      console.log(`Performed update for bookmark ID: ${id}`);
    }
  }
}

export default processBatchUpdates;
