import { useAuth } from "@/hooks/useAuth";

import { HttpError } from "./error";
import type { Tokens } from "./types/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://residentrise.com/api";

const http = async <T>({
  method,
  path,
  body,
  headers,
  retry = true,
}: {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: object;
  headers?: Record<string, string>;
  retry: boolean;
}): Promise<T> => {
  let result;
  try {
    const auth = useAuth.getState();
    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    if (headers) {
      for (const key in headers) {
        requestHeaders.append(key, headers[key]);
      }
    }

    if (auth.accessToken) {
      requestHeaders.append("Authorization", `Bearer ${auth.accessToken}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: requestHeaders,
    });

    const data = await response.json();
    if (response.status !== 200) {
      if (response.status === 401 && auth.refreshToken && retry) {
        await refresh();
        return await http<T>({
          method,
          path,
          body,
          headers,
          retry: false,
        });
      }

      throw new HttpError(
        data.error || "An unexpected HTTP response occurred, please try again.",
        response.status,
      );
    }

    result = data;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    } else if (error instanceof Error) {
      throw new HttpError(error.message, 500);
    } else {
      throw new HttpError(
        "An unexpected error occurred, please try again later.",
        500,
      );
    }
  }

  return result as T;
};

export const refresh = async () => {
  const auth = useAuth.getState();
  const response: Tokens = await http({
    method: "POST",
    path: "/auth/refresh",
    body: {
      refreshToken: auth.refreshToken,
    },
    retry: false,
  });

  auth.authenticate(response);
};

export const get = async <T>(
  path: string,
  headers?: Record<string, string>,
): Promise<T> =>
  await http<T>({
    method: "GET",
    path,
    headers,
    retry: true,
  });

export const post = async <T>(
  path: string,
  body?: object,
  headers?: Record<string, string>,
): Promise<T> =>
  await http<T>({
    method: "POST",
    path,
    body,
    headers,
    retry: true,
  });

export const put = async <T>(
  path: string,
  body?: object,
  headers?: Record<string, string>,
): Promise<T> =>
  await http<T>({
    method: "PUT",
    path,
    body,
    headers,
    retry: true,
  });

export const patch = async <T>(
  path: string,
  body?: object,
  headers?: Record<string, string>,
): Promise<T> =>
  await http<T>({
    method: "PATCH",
    path,
    body,
    headers,
    retry: true,
  });

export const del = async <T>(
  path: string,
  headers?: Record<string, string>,
): Promise<T> =>
  await http<T>({
    method: "DELETE",
    path,
    headers,
    retry: true,
  });
