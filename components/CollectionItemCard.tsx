import Link from "next/link";
import type { CollectionListItem } from "@/lib/iiif-types";

interface CollectionItemCardProps {
  item: CollectionListItem;
}

export function CollectionItemCard({ item }: CollectionItemCardProps) {
  return (
    <Link
      href={`/object/${item.detailId}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-4"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
            No thumbnail available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>
      <div className="space-y-3 p-5">
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-950">{item.title}</h2>
        <p className="line-clamp-1 text-sm text-slate-600">{item.institution}</p>
      </div>
    </Link>
  );
}
