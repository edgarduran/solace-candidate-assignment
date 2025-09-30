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
  phoneNumber: string | number;
};

export default function Home() {
  const [rows, setRows] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch("/api/advocates", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load advocates");
        const json = await res.json();
        setRows(Array.isArray(json.data) ? json.data : []);
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e.message ?? "Failed to load advocates");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((a) => {
      const specs = Array.isArray(a.specialties) ? a.specialties : [];
      return (
        a.firstName?.toLowerCase().includes(term) ||
        a.lastName?.toLowerCase().includes(term) ||
        a.city?.toLowerCase().includes(term) ||
        a.degree?.toLowerCase().includes(term) ||
        specs.some((s) => s?.toLowerCase().includes(term)) ||
        String(a.yearsOfExperience ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, q]);

  return (
    <main style={{ margin: 24 }}>
      <h1>Solace Advocates</h1>

      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <label htmlFor="search">Search</label>
        <input
          id="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, city, degree, specialty…"
          style={{ border: "1px solid #ccc", padding: "6px 8px", minWidth: 280 }}
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear search">
            Clear
          </button>
        )}
        <span aria-live="polite" style={{ marginLeft: 12 }}>
          {q ? `Searching for: “${q}”` : ""}
        </span>
      </div>

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading…</p>
      ) : err ? (
        <p role="alert" style={{ color: "crimson", marginTop: 16 }}>{err}</p>
      ) : (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
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
                  <td colSpan={7} style={{ padding: 16 }}>No results found.</td>
                </tr>
              ) : (
                filtered.map((a, i) => (
                  <tr key={String(a.id ?? `${a.firstName}-${a.lastName}-${i}`)}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.firstName}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.lastName}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.city}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.degree}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {(Array.isArray(a.specialties) ? a.specialties : []).join(", ")}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.yearsOfExperience}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{a.phoneNumber}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
