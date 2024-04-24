var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

const apiFetchBookmark = async (sessionToken, page_url) => {
    if (!sessionToken || !page_url) {
        throw new Error("All parameters (sessionToken, page_url) are required");
    }
    const base_url = "http://localhost:3000/api/bookmark";
    const params = {
        page_url: page_url,
    };
    const queryString = new URLSearchParams(params).toString();
    const url = `${base_url}?${queryString}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${sessionToken}`,
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = (await response.json());
    if (!data.success) {
        throw new Error(data.error || "Unknown error occurred");
    }
    return data;
};
const apiCreateBookmark = async (createRequest) => {
    const { sessionToken, ...postData } = createRequest;
    if (!sessionToken || !postData.title || !postData.page_url) {
        throw Error("Missing required fields (sessionToken, title, page_url).");
    }
    const url = "http://localhost:3000/api/bookmark";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(postData),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = (await response.json());
    if (!data.success) {
        throw new Error(data.error || "Unknown error occurred");
    }
    return data;
};
const apiUpdateBookmark = async (updateRequest) => {
    const { sessionToken, ...updateData } = updateRequest;
    if (!sessionToken || !updateData.id) {
        throw Error("Missing required fields (sessionToken, id)");
    }
    const url = "http://localhost:3000/api/bookmark";
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(updateData),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json());
    if (!data.success) {
        throw new Error(data.error || "Unknown error occurred");
    }
    return data;
};
const apiDeleteBookmark = async (deleteRequest) => {
    const { sessionToken, ...deleteData } = deleteRequest;
    return fetch("http://localhost:3000/api/bookmark", {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(deleteData),
    });
};

export { apiUpdateBookmark as a, apiDeleteBookmark as b, createCommonjsModule as c, commonjsGlobal as d, apiFetchBookmark as e, apiCreateBookmark as f };
//# sourceMappingURL=bookmarkAPI-40e17e4c.js.map
