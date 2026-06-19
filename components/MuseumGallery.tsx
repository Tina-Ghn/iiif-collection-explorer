"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getProxiedImageUrl } from "@/lib/images";
import type { MuseumObject } from "@/lib/types";

interface MuseumGalleryProps {
  items: MuseumObject[];
}

export function MuseumGallery({ items }: MuseumGalleryProps) {
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const artists = useMemo(
    () => Array.from(new Set(items.map((item) => item.creator).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [items],
  );
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch = [item.title, item.creator, item.date]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
        const matchesArtist = !artist || item.creator === artist;

        return matchesSearch && matchesArtist;
      }),
    [artist, items, normalizedQuery],
  );

  return (
    <section className="space-y-6">
      <div className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <label htmlFor="collection-search" className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
            Search Objects
          </label>
          <input
            id="collection-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, artist, or date..."
            className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:bg-white focus:ring-2 focus:ring-stone-200"
          />
        </div>

        <div>
          <label htmlFor="artist-filter" className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
            Filter by Artist
          </label>
          <select
            id="artist-filter"
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-950 outline-none transition focus:border-stone-500 focus:bg-white focus:ring-2 focus:ring-stone-200"
          >
            <option value="">All artists</option>
            {artists.map((artistName) => (
              <option key={artistName} value={artistName}>
                {artistName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-stone-600">
        Showing {filteredItems.length} of {items.length} objects
      </p>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/object/${item.detailId}`}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-4"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                {item.thumbnail ? (
                  <img
                    src={getProxiedImageUrl(item.thumbnail)}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <MuseumPlaceholder />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/30 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              </div>
              <div className="space-y-2 p-5">
                <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-stone-950">{item.title}</h2>
                {item.creator ? <p className="line-clamp-1 text-sm text-stone-700">{item.creator}</p> : null}
                {item.date ? <p className="text-sm text-stone-500">{item.date}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
          No objects match your search.
        </div>
      )}
    </section>
  );
}

function MuseumPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-stone-100 to-stone-200 px-6 text-center text-stone-500">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-stone-300 bg-white/60">
        <div className="h-8 w-10 rounded-sm border-2 border-stone-400" />
      </div>
      <p className="text-sm font-medium">Image not available</p>
    </div>
  );
}
