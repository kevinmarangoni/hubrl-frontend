export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

/** Opções de fetch sem `method`; use `json` para enviar corpo JSON. */
export type HttpInit = Omit<RequestInit, "method" | "headers" | "body"> & {
  headers?: HeadersInit;
  body?: BodyInit | null;
  /** Se definido, serializa o corpo e define `Content-Type: application/json` quando ausente. */
  json?: unknown;
};

export function getBackendBaseUrl(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";
}

/** Monta URL absoluta do API Nest (`/v1`). Aceita `users/me` ou `/users/me`. */
export function backendUrl(path: string): string {
  const base = getBackendBaseUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const clean = path.replace(/^\/+/, "");
  return `${base}/${clean}`;
}

export function withBearer(accessToken: string, init: HttpInit = {}): HttpInit {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  return { ...init, headers };
}

async function request(method: HttpMethod, url: string, init: HttpInit = {}): Promise<Response> {
  const { json, body, headers: headerInit, ...rest } = init;
  const headers = new Headers(headerInit);
  let resolvedBody: BodyInit | null | undefined = body;
  if (json !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    resolvedBody = JSON.stringify(json);
  }
  return fetch(url, { method, headers, body: resolvedBody, ...rest });
}

export const http = {
  request,

  get(url: string, init?: HttpInit) {
    return request("GET", url, init);
  },

  post(url: string, init?: HttpInit) {
    return request("POST", url, init);
  },

  put(url: string, init?: HttpInit) {
    return request("PUT", url, init);
  },

  patch(url: string, init?: HttpInit) {
    return request("PATCH", url, init);
  },

  delete(url: string, init?: HttpInit) {
    return request("DELETE", url, init);
  },

  head(url: string, init?: HttpInit) {
    return request("HEAD", url, init);
  },
};

function backendAuthorized(method: HttpMethod, path: string, accessToken: string, init?: HttpInit) {
  return request(method, backendUrl(path), withBearer(accessToken, init));
}

/** Chamadas ao backend Nest com `Authorization: Bearer` já aplicado. */
export const backend = {
  get(path: string, accessToken: string, init?: HttpInit) {
    return backendAuthorized("GET", path, accessToken, init);
  },
  post(path: string, accessToken: string, init?: HttpInit) {
    return backendAuthorized("POST", path, accessToken, init);
  },
  put(path: string, accessToken: string, init?: HttpInit) {
    return backendAuthorized("PUT", path, accessToken, init);
  },
  patch(path: string, accessToken: string, init?: HttpInit) {
    return backendAuthorized("PATCH", path, accessToken, init);
  },
  delete(path: string, accessToken: string, init?: HttpInit) {
    return backendAuthorized("DELETE", path, accessToken, init);
  },
  head(path: string, accessToken: string, init?: HttpInit) {
    return backendAuthorized("HEAD", path, accessToken, init);
  },
};
