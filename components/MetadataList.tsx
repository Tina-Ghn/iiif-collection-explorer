import type { ManifestDetail } from "@/lib/iiif-types";

interface MetadataListProps {
  metadata: ManifestDetail["metadata"];
}

export function MetadataList({ metadata }: MetadataListProps) {
  if (metadata.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-stone-600">
        No metadata available.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <tbody className="divide-y divide-stone-200">
          {metadata.map((item, index) => (
            <tr key={`${item.label}-${index}`} className="align-top">
              <th className="w-1/3 bg-stone-50 px-5 py-4 font-semibold text-stone-950">{item.label}</th>
              <td className="px-5 py-4 leading-6 text-stone-700">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
