import { CollectionItemCard } from "@/components/CollectionItemCard";
import type { CollectionListItem } from "@/lib/iiif-types";

interface CollectionGridProps {
  items: CollectionListItem[];
}

export function CollectionGrid({ items }: CollectionGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
        No manifest items were found in this IIIF collection.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <CollectionItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
