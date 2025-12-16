import { useState } from "react";
import { wsr } from "@/utils/wsr";

type MutationMethod = "POST" | "PUT" | "DELETE";

export function useWsrMutation() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutate = async <T = any>(
    url: string,
    options: {
      method: MutationMethod;
      body?: any;
    },
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await wsr<T>(url, options);
      return res;
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Something went wrong";

      setErrorMsg(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, errorMsg };
}
