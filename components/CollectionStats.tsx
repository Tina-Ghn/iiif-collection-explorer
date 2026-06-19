import type { MuseumCollection } from "@/lib/types";

interface CollectionStatsProps {
  collection: MuseumCollection;
}

export function CollectionStats({ collection }: CollectionStatsProps) {
  const stats = [
    { label: "Total objects", value: collection.stats.totalObjects.toLocaleString() },
    { label: "Earliest year", value: collection.stats.earliestYear?.toString() ?? "Unknown" },
    { label: "Latest year", value: collection.stats.latestYear?.toString() ?? "Unknown" },
    { label: "Unique artists", value: collection.stats.uniqueArtists.toLocaleString() },
  ];

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-stone-200 pb-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Collection</p>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{collection.title}</h1>
        <p className="text-sm text-stone-500">Cache generated {new Date(collection.generatedAt).toLocaleString()}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl bg-stone-50 p-5">
            <p className="text-sm text-stone-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-stone-950">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
