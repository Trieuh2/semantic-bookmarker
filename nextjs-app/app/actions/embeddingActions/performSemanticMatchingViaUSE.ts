import * as tf from "@tensorflow/tfjs";
import { TensorFlowUtility } from "@/app/libs/tensorFlow";
import { BadRequestError, UnauthorizedError } from "@/app/libs/errors";
import { FullBookmarkType } from "@/app/types";
import getIsSessionValid from "../sessionActions/getIsSessionValid";

const performSemanticMatchingViaUSE = async (
  sessionToken: string,
  bookmarks: FullBookmarkType[] | undefined,
  collection_names: string[] | undefined
): Promise<Map<string, string[]>> => {
  // Validate parameters
  if (
    !sessionToken ||
    !bookmarks ||
    !collection_names ||
    (bookmarks && bookmarks.length === 0) ||
    (collection_names && collection_names.length === 0)
  ) {
    throw new BadRequestError(
      "Error filtering bookmarks against collection names. Missing required fields: sessionToken, bookmarks, collection_names"
    );
  }

  // Validate session
  if (!(await getIsSessionValid(sessionToken))) {
    throw new UnauthorizedError(
      "Error filtering bookmarks against collection names. Invalid or expired session."
    );
  }

  const matchings = await semanticMatchBooksToCols(bookmarks, collection_names);
  return matchings;
};

async function semanticMatchBooksToCols(
  bookmarks: FullBookmarkType[],
  collection_names: string[]
) {
  // let startTime = performance.now();
  // console.log("\n\n\n\n\n");
  // console.log("==============================");
  // console.log("CLEANSED DATA");
  // console.log("==============================");

  const tfUtility = TensorFlowUtility.getInstance();

  const filteredCollectionNames = collection_names.filter(
    (name) => name !== "Unsorted"
  );
  const cleansedCollectionData = filteredCollectionNames.map((name) => {
    return cleanText(normalizeText(name));
  });
  const collectionEmbeddings = await tfUtility.generateEmbeddings(
    cleansedCollectionData
  );

  // Pre-process bookmarks
  const cleansedBookmarkData = bookmarks.map((bookmark) => {
    const combinedString = combineBookmarkFields(bookmark);
    const cleanedString = truncateText(
      normalizeWhitespace(cleanText(normalizeText(combinedString)))
    );
    return cleanedString;
  });
  // console.log("Cleansed collections data:", cleansedCollectionData);
  // console.log("Cleansed bookmark data:", cleansedBookmarkData);

  const bookmarkEmbeddings = await Promise.all(
    cleansedBookmarkData.map(async (bookmark) => {
      return await tfUtility.generateEmbeddings([bookmark]);
    })
  );

  // Iterate through each bookmark embedding and compare it against the collection embeddings
  const bestMappings: Map<string, string[]> = new Map();

  for (let bIndex = 0; bIndex < bookmarkEmbeddings.length; bIndex++) {
    let maxSimilarity = -Infinity;
    const bookmarkEmbedding = bookmarkEmbeddings[bIndex];
    const arr = await collectionEmbeddings.array();
    let bestMatchIdx = -1;

    // For the current bookmark, compare against all collection embeddings and store the collection with the highest similarity
    arr.forEach((collectionEmbedding, cIndex) => {
      const similarity = tfUtility.cosineSimilarity(
        bookmarkEmbedding,
        tf.tensor(collectionEmbedding)
      );
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestMatchIdx = cIndex;
      }
    });
    const collectionName = filteredCollectionNames[bestMatchIdx];
    if (!bestMappings.has(collectionName)) {
      bestMappings.set(collectionName, []);
    }
    bestMappings.get(collectionName)!.push(bookmarks[bIndex].title);
    // console.log(`bookmark: "${bookmarks[bIndex].title}"`);
    // console.log(`excerpt: ${bookmarks[bIndex].excerpt}`);
    // console.log(`collection: "${collectionName}"`);
    // console.log(`score: ${maxSimilarity}\n`);
  }

  // let endTime = performance.now();
  // console.log("==============================");
  // console.log("RESULTS");
  // console.log("==============================");
  // console.log(bestMappings);
  // console.log("==============================");
  // console.log("STATS");
  // console.log("==============================");
  // console.log("Start time:", startTime);
  // console.log("End time:", endTime);
  // console.log("Time elapsed:", ` ${(endTime - startTime) / 1000} seconds.`);
  // console.log("==============================");
  // console.log("\n");

  return bestMappings;
}

const combineBookmarkFields = (bookmark: FullBookmarkType): string => {
  return [bookmark.title, bookmark.excerpt].filter(Boolean).join(" ");
};

const normalizeText = (text: string) => {
  return text.toLowerCase().trim();
};

const normalizeWhitespace = (text: string) => {
  return text.replace(/\s+/g, " ").trim();
};

const cleanText = (text: string) => {
  // Remove URLs
  text = text.replace(/(https?:\/\/[^\s]+)/g, "");
  // Remove special characters and numbers
  text = text.replace(/[^a-zA-Z\s]/g, "");
  // Convert to lowercase
  text = text.toLowerCase();
  return text;
};

const removeDuplicateWords = (text: string) => {
  const words = text.split(" ");
  const uniqueWords = new Set(words); // Set automatically removes duplicates
  return Array.from(uniqueWords).join(" ");
};

const truncateText = (text: string, maxLength = 512) => {
  return text.substring(0, maxLength);
};

export { performSemanticMatchingViaUSE };
