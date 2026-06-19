import { GallerySkeleton } from "@/components/GallerySkeleton";

export default function Loading() {
  return (
    <div className="space-y-10">
      <header className="max-w-3xl space-y-4">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-12 w-full max-w-xl animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
      </header>

      <GallerySkeleton />
    </div>
  );
}
