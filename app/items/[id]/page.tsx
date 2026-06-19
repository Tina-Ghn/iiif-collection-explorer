import Link from "next/link";
import { MuseumObjectDetail } from "@/components/MuseumObjectDetail";
import { fetchIIIFManifest, parseManifest } from "@/lib/iiif";
import { decodeManifestId } from "@/lib/routes";
import type { IIIFV2Manifest } from "@/lib/types";

interface ItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const manifestId = decodeManifestId(id);
  const manifest = await fetchIIIFManifest(manifestId);
  const object = parseManifest(manifest as unknown as IIIFV2Manifest);

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex text-sm font-medium text-stone-600 transition hover:text-stone-950">
        ← Back to collection
      </Link>
      <MuseumObjectDetail object={object} />
    </div>
  );
}
