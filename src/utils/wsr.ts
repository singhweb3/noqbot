"use client";

import useSWR from "swr";

/* ================= TYPES ================= */

type WsrOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

type ApiError = Error & {
  status?: number;
};

/* ================= FETCHER ================= */

const fetcher = async <T = any>(
  url: string,
  options?: WsrOptions,
): Promise<T> => {
  const res = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    // response has no JSON body
  }

  if (!res.ok) {
    const error: ApiError = new Error(data?.message || "Request failed");
    error.status = res.status;
    throw error;
  }

  return data;
};

/* ================= GET HOOK ================= */

export function useWsr<T>(url: string | null) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    // 🔥 IMPORTANT: STOP infinite retry loops
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
  });

  return {
    data,
    loading: isLoading,
    error: error as ApiError | undefined,
    refetch: mutate,
  };
}

/* ================= MUTATION ================= */

export async function wsr<T = any>(
  url: string,
  options?: WsrOptions,
): Promise<T> {
  return fetcher<T>(url, options);
}
