"use client";

import useSWR from "swr";

type WsrOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
};

const fetcher = async (url: string, options?: WsrOptions) => {
  const res = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json();
};

/**
 * GET (hook)
 */
export function useWsr<T>(url: string) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher);

  return {
    data,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * MUTATION (POST / PUT / DELETE)
 */
export async function wsr<T = any>(
  url: string,
  options?: WsrOptions,
): Promise<T> {
  return fetcher(url, options);
}
