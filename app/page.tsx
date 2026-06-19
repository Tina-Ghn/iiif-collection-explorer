import { CacheMissingNotice } from "@/components/CacheMissingNotice";
import { CollectionStats } from "@/components/CollectionStats";
import { MuseumGallery } from "@/components/MuseumGallery";
import { fetchMuseumCollection, MuseumCollectionCacheMissingError } from "@/lib/iiif";

export const dynamic = "force-dynamic";

export default async function Home() {
  let collection;

  try {
    collection = await fetchMuseumCollection();
  } catch (error) {
    if (error instanceof MuseumCollectionCacheMissingError) {
      return (
        <div className="space-y-10">
          <Header />
          <CacheMissingNotice />
        </div>
      );
    }

    throw error;
  }

  return (
    <div className="space-y-10">
      <Header sourceUrl={collection.sourceUrl} />

      <CollectionStats collection={collection} />
      <MuseumGallery items={collection.objects} />
    </div>
  );
}

function Header({ sourceUrl }: { sourceUrl?: string }) {
  return (
    <header className="max-w-4xl space-y-4">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Museum Collection Explorer</p>
      <h1 className="text-5xl font-semibold tracking-tight text-stone-950">Explore the collection</h1>
      <p className="text-lg leading-8 text-stone-700">
        Browse museum objects from the local IIIF cache. Refresh it manually with <code>npm run sync-collection</code>.
      </p>
      {sourceUrl ? (
        <p className="break-all rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600 shadow-sm">
          Source: {sourceUrl}
        </p>
      ) : null}
    </header>
  );
}
