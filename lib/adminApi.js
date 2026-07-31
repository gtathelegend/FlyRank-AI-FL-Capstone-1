const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const adminFetch = async (path, options = {}) => {
  const response = await fetch(path, {
    cache: "no-store",
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("Session expired");
  }

  const body = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }

  return body;
};
