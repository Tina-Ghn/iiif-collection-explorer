import { getProxiedImageUrl } from "@/lib/images";
import type { MuseumObject } from "@/lib/types";

interface MuseumObjectDetailProps {
  object: MuseumObject;
}

export function MuseumObjectDetail({ object }: MuseumObjectDetailProps) {
  return (
    <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      <figure className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100 shadow-sm">
        <div className="flex min-h-[420px] items-center justify-center p-4 sm:min-h-[620px]">
          {object.imageUrl ? (
            <img src={getProxiedImageUrl(object.imageUrl)} alt={object.title} className="max-h-[780px] w-full object-contain" />
          ) : (
            <div className="px-6 text-center text-stone-500">No image available for this object.</div>
          )}
        </div>
      </figure>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <div className="space-y-4 border-b border-stone-200 pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Museum Object</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">{object.title}</h1>
        </div>

        <dl className="mt-8 divide-y divide-stone-200">
          {object.creator ? (
            <div className="grid gap-2 py-4 sm:grid-cols-3">
              <dt className="text-sm font-semibold uppercase tracking-wide text-stone-500">Creator</dt>
              <dd className="text-stone-950 sm:col-span-2">{object.creator}</dd>
            </div>
          ) : null}

          {object.date ? (
            <div className="grid gap-2 py-4 sm:grid-cols-3">
              <dt className="text-sm font-semibold uppercase tracking-wide text-stone-500">Date</dt>
              <dd className="text-stone-950 sm:col-span-2">{object.date}</dd>
            </div>
          ) : null}
        </dl>

        {object.metadata.length > 0 ? (
          <div className="mt-8 space-y-4">
            <h2 className="font-serif text-2xl text-stone-950">Metadata</h2>
            <div className="overflow-hidden rounded-2xl border border-stone-200">
              <table className="w-full border-collapse text-left text-sm">
                <tbody className="divide-y divide-stone-200">
                  {object.metadata.map((item, index) => (
                    <tr key={`${item.label}-${index}`} className="align-top">
                      <th className="w-1/3 bg-stone-50 px-4 py-3 font-semibold text-stone-950">{item.label}</th>
                      <td className="px-4 py-3 leading-6 text-stone-700">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="mt-8 space-y-3">
          <h2 className="font-serif text-2xl text-stone-950">Description</h2>
          <p className="whitespace-pre-line leading-8 text-stone-700">{object.description}</p>
        </div>
      </section>
    </article>
  );
}
