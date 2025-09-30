"use client";

import { useEffect, useMemo, useState } from "react";

type Advocate = {
  id?: string | number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number | string;
  phoneNumber: string;
};

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/advocates", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load advocates");
        const json = await res.json();
        if (!cancelled) {
          setAdvocates(json.data ?? []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load advocates");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return advocates;
    return advocates.filter((a) => {
      const specialties = Array.isArray(a.specialties) ? a.specialties : [];
      return (
        a.firstName?.toLowerCase().includes(term) ||
        a.lastName?.toLowerCase().includes(term) ||
        a.city?.toLowerCase().includes(term) ||
        a.degree?.toLowerCase().includes(term) ||
        specialties.some((s) => s?.toLowerCase().includes(term)) ||
        String(a.yearsOfExperience ?? "").toLowerCase().includes(term)
      );
    });
  }, [advocates, search]);

  if (loading) {
    return (
      <main style={{ margin: 24 }}>
        <h1>Solace Advocates</h1>
        <p>Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ margin: 24 }}>
        <h1>Solace Advocates</h1>
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
        <button onClick={() => location.reload()}>Retry</button>
      </main>
    );
  }

  return (
    <main style={{ margin: 24 }}>
      <h1>Solace Advocates</h1>

      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <label htmlFor="search">Search</label>
        <input
          id="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, city, specialty…"
          style={{ border: "1px solid #ccc", padding: "6px 8px", minWidth: 280 }}
        />
        {search && (
          <button onClick={() => setSearch("")} aria-label="Clear search">
            Clear
          </button>
        )}
        <span aria-live="polite" style={{ marginLeft: 12 }}>
          {search ? `Searching for: “${search}”` : ""}
        </span>
      </div>

      <div style={{ marginTop: 24, overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <caption className="sr-only">List of advocates</caption>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>First Name</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Last Name</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>City</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Degree</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Specialties</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Years of Experience</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 16 }}>
                  No results found.
                </td>
              </tr>
            ) : (
              filtered.map((a, idx) => (
                <tr key={a.id ?? `${a.firstName}-${a.lastName}-${idx}`}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.firstName}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.lastName}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.city}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.degree}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {(Array.isArray(a.specialties) ? a.specialties : []).map((s, i) => (
                      <div key={i}>{s}</div>
                    ))}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.yearsOfExperience}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.phoneNumber}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
