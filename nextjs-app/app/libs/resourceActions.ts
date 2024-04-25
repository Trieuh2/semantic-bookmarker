import axios from "axios";

export const deleteResource = async (
  type: string,
  identifier: string,
  sessionToken: string,
  onSuccess: (type: string, identifier: string) => void,
  onError: (error: any) => void
) => {
  try {
    await axios.delete(`/api/${type}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      data: { id: identifier },
    });
    onSuccess(type, identifier);
  } catch (error) {
    onError(error);
  }
};
