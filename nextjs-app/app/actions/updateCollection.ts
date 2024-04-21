import { BadRequestError, NotFoundError } from "../libs/errors";
import createOrFetchCollection from "./createOrFetchCollection";
import getUserIdFromSessionToken from "./getUserIdFromSessionToken";

const updateCollection = async (
  sessionToken: string,
  collection_name: string
) => {
  if (!sessionToken || !collection_name) {
    throw new BadRequestError("Missing sessionToken or collection_name.");
  }

  const userId = await getUserIdFromSessionToken(sessionToken);

  const collection = await createOrFetchCollection(
    userId ?? "",
    collection_name
  );

  if (!collection) {
    throw new NotFoundError("Error creating or fetching collection.");
  }
  return collection;
};

export default updateCollection;
