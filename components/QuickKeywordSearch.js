"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuickKeywordSearch() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const parsedKeywords = keywords.split(/[\n,]+/).map((value) => value.trim()).filter(Boolean);
    if (!parsedKeywords.length) return setError("Please enter at least one keyword.");
    setLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ("Quick Search - " + parsedKeywords[0]).slice(0, 150),
          country,
          language,
          keywords: parsedKeywords,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create search job.");
      setKeywords("");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to create search job.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#0d1422] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Quick keyword search</p>
      <h2 className="mt-2 text-2xl font-black">Type keywords and prepare a traffic check</h2>
      <p className="mt-2 text-sm text-slate-400">Separate multiple keywords with commas or new lines.</p>
      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 xl:grid-cols-[1.7fr_0.7fr_0.6fr_auto]">
        <textarea value={keywords} onChange={(event) => setKeywords(event.target.value)} rows={2} placeholder="nike discount code, nike promo code" className="min-h-14 resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-slate-600" />
        <select value={country} onChange={(event) => setCountry(event.target.value)} className="rounded-xl border border-white/10 bg-[#080d17] px-4 py-3 text-white">
          <option>United Kingdom</option><option>United States</option><option>Pakistan</option><option>Canada</option><option>Australia</option><option>United Arab Emirates</option>
        </select>
        <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-xl border border-white/10 bg-[#080d17] px-4 py-3 text-white">
          <option>English</option><option>Urdu</option><option>Arabic</option><option>French</option><option>German</option>
        </select>
        <button disabled={loading} className="rounded-xl bg-cyan-400 px-6 py-3 font-black text-slate-950 disabled:opacity-60">{loading ? "Adding..." : "Search"}</button>
      </form>
      {error && <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
    </section>
  );
}
