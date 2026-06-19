import { MetadataList } from "@/components/MetadataList";
import type { ManifestDetail } from "@/lib/iiif-types";

interface ManifestDetailViewProps {
  manifest: ManifestDetail;
}

export function ManifestDetailView({ manifest }: ManifestDetailViewProps) {
  return (
    <article className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <figure className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100 shadow-sm">
          <div className="flex min-h-[420px] items-center justify-center p-4 sm:min-h-[560px]">
            {manifest.imageUrl ? (
              <img src={manifest.imageUrl} alt={manifest.title} className="max-h-[760px] w-full object-contain" />
            ) : (
              <div className="flex min-h-96 items-center justify-center px-6 text-center text-stone-500">
                No image available for this object.
              </div>
            )}
          </div>
        </figure>

        <div className="flex flex-col justify-between rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <div className="space-y-8">
            <div className="space-y-4 border-b border-stone-200 pb-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">{manifest.institution}</p>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">{manifest.title}</h1>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-2xl text-stone-950">Description</h2>
              <p className="leading-8 text-stone-700">{manifest.description}</p>
            </div>
          </div>

          <div className="mt-10 space-y-3 border-t border-stone-200 pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Source URL</p>
            <a
              href={manifest.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="block break-all text-sm font-medium text-stone-950 underline decoration-stone-300 underline-offset-4 transition hover:decoration-stone-950"
            >
              {manifest.sourceUrl}
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between border-b border-stone-200 pb-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Object Record</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-950">Metadata</h2>
          </div>
        </div>
        <MetadataList metadata={manifest.metadata} />
      </section>
    </article>
  );
}
