interface GallerySkeletonProps {
  count?: number;
}

export function GallerySkeleton({ count = 8 }: GallerySkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="aspect-[4/3] animate-pulse bg-stone-200" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-4/5 animate-pulse rounded bg-stone-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
