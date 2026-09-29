"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";

// Generic dropdown-options loader - the backend owns every option list (slug -> [{ value, label }]).
// Frontend never hardcodes option values/labels, only the slug it wants (e.g. "property_status").
export function useDictionary(slug) {
  const request = useApi();
  const [options, setOptions] = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    request(`/dictionary/options?slug=${encodeURIComponent(slug)}`, undefined, { method: "GET" })
      .then((res) => setOptions(res.data))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return { options, loading };
}
