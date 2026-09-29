"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";

// Loads a single page of properties, large enough to populate select dropdowns.
// Property shape is whatever the backend returns - not re-declared here.
export function useProperties() {
  const request = useApi();
  const [properties, setProperties] = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request("/property/list?current_page=1&per_page=100", undefined, { method: "GET" })
      .then((res) => setProperties(res.data.list))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { properties, loading };
}
