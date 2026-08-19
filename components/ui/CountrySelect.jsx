"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES } from "@/lib/google-ads/geo-targets";
import { cn } from "@/lib/utils";

export default function CountrySelect({
  value,
  onChange,
  className = "h-10 min-w-44 rounded-lg border border-white/10 bg-[#0d1625] px-3 text-sm font-medium text-white outline-none focus:border-cyan-400/30",
  id,
  name,
  placeholder = "Select a country",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const widthClasses = useMemo(() => {
    if (!className) return "";
    return className
      .split(" ")
      .filter((c) => c.startsWith("w-") || c.startsWith("min-w-") || c.startsWith("max-w-"))
      .join(" ");
  }, [className]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((country) => country.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    function handleMouseDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function selectCountry(country) {
    onChange(country);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(event) {
    if (!open && event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlighted(0);
      return;
    }
    if (!open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % filtered.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => (index - 1 + filtered.length) % filtered.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[highlighted]) selectCountry(filtered[highlighted]);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", widthClasses)}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        value={open ? query : value}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
          setHighlighted(0);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full text-sm transition placeholder:text-slate-600",
          className
        )}
      />
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#0d1625] py-1 shadow-2xl shadow-black/50"
        >
          {filtered.length ? (
            filtered.map((country, index) => (
              <li key={country} role="option" aria-selected={value === country}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectCountry(country);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm",
                    index === highlighted
                      ? "bg-cyan-300/10 text-cyan-100"
                      : value === country
                        ? "text-cyan-200"
                        : "text-slate-200"
                  )}
                >
                  <span>{country}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-2.5 text-sm text-slate-500">No matching country</li>
          )}
        </ul>
      )}
    </div>
  );
}
