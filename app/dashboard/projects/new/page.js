"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as XLSX from "xlsx";

function normaliseRow(row) {
  const store = row["Store Name"] ?? row.store ?? row.Store ?? row.name ?? "";
  const keyword = row.Keyword ?? row.keyword ?? "";
  const country = row.Country ?? row.country ?? "United Kingdom";
  const language = row.Language ?? row.language ?? "English";
  return {
    store: String(store).trim(),
    keyword: String(keyword).trim(),
    country: String(country || "United Kingdom").trim(),
    language: String(language || "English").trim(),
  };
}

export default function NewProject() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileRows, setFileRows] = useState([]);

  async function readFile(file) {
    setError("");
    setFileName(file?.name || "");
    setFileRows([]);
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const rows = rawRows.map(normaliseRow).filter((row) => row.store && row.keyword);
      if (!rows.length) throw new Error("No valid rows found. Use the provided template columns.");
      setFileRows(rows);
    } catch (err) {
      setError(err.message || "Unable to read this file");
    }
  }

  async function submitManual(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const keywords = String(form.get("keywords") || "")
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        country: form.get("country"),
        language: form.get("language"),
        keywords,
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setError(data.error);
    router.push("/dashboard");
    router.refresh();
  }

  async function importFile() {
    if (!fileRows.length) return setError("Select a valid CSV or Excel file first.");
    setLoading(true);
    setError("");
    const response = await fetch("/api/projects/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: fileRows }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setError(data.error);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => router.back()} className="text-sm font-semibold text-slate-400 hover:text-white">← Back</button>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-[#0d1422] p-8 shadow-2xl shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Bulk import</p>
                <h1 className="mt-3 text-3xl font-black">Upload CSV or Excel</h1>
                <p className="mt-2 text-slate-400">One file can contain hundreds of stores and thousands of keywords.</p>
              </div>
              <a href="/api/templates/keywords" className="shrink-0 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300 hover:bg-cyan-400/20">Download template</a>
            </div>

            <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-600 bg-[#080d17] px-6 py-12 text-center hover:border-cyan-400/60">
              <span className="text-lg font-bold">Choose CSV, XLSX or XLS file</span>
              <span className="mt-2 text-sm text-slate-500">Required columns: Store Name, Keyword, Country, Language</span>
              <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => readFile(event.target.files?.[0])} />
            </label>

            {fileName && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-bold">{fileName}</div>
                <div className="mt-1 text-sm text-slate-400">{fileRows.length} valid rows ready to import</div>
              </div>
            )}

            <button onClick={importFile} disabled={loading || !fileRows.length} className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
              {loading ? "Importing..." : "Import file"}
            </button>
          </section>

          <form onSubmit={submitManual} className="rounded-3xl border border-white/10 bg-[#0d1422] p-8 shadow-2xl shadow-black/20">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">Manual project</p>
            <h2 className="mt-3 text-3xl font-black">Create one store</h2>
            <p className="mt-2 text-slate-400">Use this for a quick single-store keyword check.</p>

            {error && <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

            <label className="mt-6 block text-sm font-bold text-slate-200">Project / store name</label>
            <input name="name" required className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d17] px-4 py-3 text-white outline-none focus:border-violet-400" />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-200">Country</label>
                <input name="country" defaultValue="United Kingdom" required className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d17] px-4 py-3 text-white outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-200">Language</label>
                <input name="language" defaultValue="English" required className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d17] px-4 py-3 text-white outline-none focus:border-violet-400" />
              </div>
            </div>

            <label className="mt-4 block text-sm font-bold text-slate-200">Keywords</label>
            <textarea name="keywords" rows="9" placeholder={"nike discount code\nnike promo code\nnike voucher code"} className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d17] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-violet-400" />
            <p className="mt-2 text-xs text-slate-500">One keyword per line or comma separated. Duplicates are removed.</p>

            <button disabled={loading} className="mt-6 w-full rounded-xl bg-violet-500 px-6 py-3 font-black text-white disabled:opacity-50">
              {loading ? "Creating..." : "Create project"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
