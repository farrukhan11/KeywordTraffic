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
  const listRef = useRef(null);

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

  const ordered = useMemo(() => {
    if (query.trim() || !value) return filtered;
    return [value, ...filtered.filter((country) => country !== value)];
  }, [filtered, query, value]);

  useEffect(() => {
    function handleMouseDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlighted(0);
    }
  }, [open]);

  useEffect(() => {
    if (open && value) {
      const index = ordered.findIndex((country) => country === value);
      if (index >= 0) setHighlighted(index);
    }
  }, [open, ordered, value]);

  useEffect(() => {
    if (open && listRef.current) {
      const item = listRef.current.children[highlighted];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [open, highlighted]);

  function selectCountry(country) {
    onChange(country);
    setOpen(false);
    setQuery("");
  }

  function toggle() {
    if (!open) {
      inputRef.current?.focus();
    } else {
      setOpen(false);
    }
  }

  function handleKeyDown(event) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
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
      setHighlighted((index) => (index + 1) % ordered.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => (index - 1 + ordered.length) % ordered.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (ordered[highlighted]) selectCountry(ordered[highlighted]);
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
        aria-controls="country-select-listbox"
        autoComplete="off"
        onMouseDown={(event) => {
          if (document.activeElement === inputRef.current) {
            event.preventDefault();
            toggle();
          }
        }}
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
          "w-full cursor-pointer text-sm transition placeholder:text-slate-600",
          "pr-10",
          className
        )}
      />
      <button
        type="button"
        aria-label={open ? "Close country list" : "Open country list"}
        onMouseDown={(event) => {
          event.preventDefault();
          toggle();
        }}
        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:text-cyan-300"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-transform duration-150", open && "rotate-180")}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id="country-select-listbox"
          role="listbox"
          aria-label="Countries"
          ref={listRef}
          className="absolute left-0 right-0 z-30 mt-1 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-[#0d1625] py-1 shadow-2xl shadow-black/60"
        >
          <li className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[#0d1625] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>{query.trim() ? "Searching countries" : "All countries"}</span>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-slate-400">
              {ordered.length}
            </span>
          </li>
          {ordered.length ? (
            ordered.map((country, index) => {
              const selected = value === country;
              return (
                <li key={country} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectCountry(country);
                    }}
                    onMouseEnter={() => setHighlighted(index)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm",
                      index === highlighted
                        ? "bg-cyan-300/10 text-cyan-100"
                        : selected
                          ? "text-cyan-200"
                          : "text-slate-200"
                    )}
                  >
                    <span className="min-w-0">
                      <span className={cn(selected && "font-semibold")}>{country}</span>
                      {selected && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-300/80">
                          Selected
                        </span>
                      )}
                    </span>
                    {selected && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-cyan-300"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-6 text-center text-sm text-slate-500">
              No countries match “{query.trim()}”
            </li>
          )}
        </ul>
      )}
    </div>
  );
}