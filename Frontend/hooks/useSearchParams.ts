"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

export function useSearchParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set(key, value);

    router.push(`${pathname}?${params.toString()}`);
  };

  const getParam = (key: string) => {
    return searchParams.get(key);
  };

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(key);

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const hasParam = (key: string) => {
    return searchParams.has(key);
  };

  const setParams = (values: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      params.set(key, value);
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const removeParams = (keys: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    keys.forEach((key) => {
      params.delete(key);
    });

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return {
    getParam,
    setParam,
    removeParam,
    hasParam,
    setParams,
    removeParams,
  };
}