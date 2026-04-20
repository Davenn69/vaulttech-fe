import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { api } from "@/lib/cores/utils/api";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { SearchItem } from "../types/search";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSearch = useCallback(async (keyword: string) => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const res = await api.get<ApiResponse<SearchItem[]>>("/search", {
        query: trimmedKeyword,
      });

      setResults(res.data ?? []);
    } catch (error) {
      const message = axios.isAxiosError<ApiResponseError>(error)
        ? error.response?.data.message
        : "Failed to search";

      toast.error(message ?? "Failed to search");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      fetchSearch(trimmedQuery);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [fetchSearch, query]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    clearSearch,
  };
}
