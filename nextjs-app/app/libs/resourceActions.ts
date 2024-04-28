import axios from "axios";

const validEndpoints = ["bookmark", "collection", "tag"];

export const axiosFetchResource = async (
  endpoint: string,
  sessionToken: string,
  params: Record<string, any> = {}
) => {
  try {
    if (!validEndpoints.includes(endpoint)) {
      throw new Error("Invalid endpoint");
    }

    const response = await axios.get(`http://localhost:3000/api/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      params: params,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}: `, error);
    return null;
  }
};

export const axiosDeleteResource = async (
  endpoint: string,
  identifier: string,
  sessionToken: string,
  onSuccess: (type: string, identifier: string) => void,
  onError: (error: any) => void
) => {
  try {
    await axios.delete(`/api/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      data: { id: identifier },
    });
    onSuccess(endpoint, identifier);
  } catch (error) {
    onError(error);
  }
};

export const axiosUpdateResource = async (
  endpoint: string,
  data: Record<string, any> = {},
  sessionToken: string,
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  try {
    await axios.patch(`/api/${endpoint}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    onSuccess();
  } catch (error) {
    onError(error);
  }
};
