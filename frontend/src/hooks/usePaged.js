import { useCallback, useEffect, useState } from "react";
import { api } from "@/utils/api";
import useDebounce from "./useDebounce";

// List dari backend: pagination + search (debounce 300ms) + limit + filter
export default function usePaged(url, params = {}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const q = useDebounce(search, 300);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify(params);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(url, { params: { ...params, page, limit, search: q } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch (e) {
      setError(e.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key, page, limit, q]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { setPage(1); }, [q, limit, key]);

  return { rows, pagination, loading, error, reload, search, setSearch, setPage, limit, setLimit };
}
